import 'dart:convert';
import 'dart:io';

import 'package:csv/csv.dart';
import 'package:http/http.dart' as http;
import 'package:yaml/yaml.dart';

const emtaOpenDataPage =
    'https://www.emta.ee/en/private-client/board-news-and-contacts/'
    'news-press-information-statistics/statistics-and-open-data';

const inputCompaniesFile = 'companies.yaml';
const outputFile = 'companies_quarterly.json';

Future<void> main() async {
  print('=== Market Monitor — Quarterly ===');

  final companies = await loadCompanies(inputCompaniesFile);
  print('Companies in YAML: ${companies.length}');

  final wantedCodes = companies.map((c) => c.registryCode).toSet();

  // ------------------------------------------------------------
  // 1. Get the current EMTA CSV links from the official page.
  // ------------------------------------------------------------

  print('\n[1/3] Reading EMTA open-data page...');
  final csvUrls = await findEmtaCsvUrls();

  if (csvUrls.isEmpty) {
    throw Exception(
      'No EMTA CSV links were found on the official open-data page.\n'
      'Check the page or the URL in emtaOpenDataPage.',
    );
  }

  print('CSV files found: ${csvUrls.length}');
  for (final url in csvUrls) {
    print('  $url');
  }

  // ------------------------------------------------------------
  // 2. Download and merge the CSV datasets.
  // ------------------------------------------------------------

  print('\n[2/3] Downloading quarterly EMTA data...');

  final quarterly = <String, List<QuarterRecord>>{};
  final seenKeys = <String>{};

  for (final url in csvUrls) {
    print('\nDownloading: $url');

    final bytes = await downloadFile(url);
    print('Downloaded: ${bytes.length} bytes');

    final part = readQuarterlyCsv(bytes, wantedCodes);
    print('Matching company rows: ${part.values.fold<int>(0, (sum, e) => sum + e.length)}');

    for (final entry in part.entries) {
      final list = quarterly.putIfAbsent(entry.key, () => []);

      for (final record in entry.value) {
        final key = '${entry.key}|${record.year}|Q${record.quarter}';

        // The two EMTA datasets should not overlap, but protect against
        // accidental duplicates after future source changes.
        if (seenKeys.add(key)) {
          list.add(record);
        }
      }
    }
  }

  // ------------------------------------------------------------
  // 2b. Enrich the quarterly dataset from Inforegister.
  //
  // Inforegister publishes two quarterly tables on company pages:
  // 1) financial indicators: projected turnover, taxable turnover,
  //    state taxes, labour taxes, projected labour productivity,
  //    labour productivity;
  // 2) employee indicators: employees, turnover/employee,
  //    profit/employee, average gross wage.
  //
  // EMTA remains the primary source for the four basic source values
  // already present in the bulk CSV. Inforegister supplies the additional
  // indicators and also fills the 2020-2021 gap when available.
  // ------------------------------------------------------------

  print('\n[2b/3] Enriching quarterly data from Inforegister...');
  await enrichFromInforegister(
    companies,
    quarterly,
  );

  // ------------------------------------------------------------
  // 3. Build companies_quarterly.json.
  // ------------------------------------------------------------

  print('\n[3/3] Building JSON...');

  final result = <Map<String, dynamic>>[];

  for (final company in companies) {
    final history = quarterly[company.registryCode] ?? <QuarterRecord>[];

    history.sort((a, b) {
      final byYear = b.year.compareTo(a.year);
      if (byYear != 0) return byYear;
      return b.quarter.compareTo(a.quarter);
    });

    final records = history.map((r) => r.toJson()).toList();
    final latest = records.isNotEmpty ? records.first : null;

    final dataStatus = records.isNotEmpty ? 'ok' : 'no_quarterly_data';

    result.add({
      'name': company.name,
      'registryCode': company.registryCode,
      'website': company.website,
      'note': company.note,
      'dataStatus': dataStatus,
      'latest': latest,
      'history': records,
    });

    if (latest != null) {
      print(
        '${company.name}: '
        '${latest['year']} Q${latest['quarter']} / '
        'taxableTurnover=${latest['taxableTurnover'] ?? '-'} / '
        'stateTaxes=${latest['stateTaxes'] ?? '-'} / '
        'labourTaxes=${latest['labourTaxes'] ?? '-'} / '
        'employees=${latest['employees'] ?? '-'} / '
        'turnoverPerEmployee=${latest['taxableTurnoverPerEmployee'] ?? '-'} / '
        'projectedTurnover=${latest['projectedTurnover'] ?? '-'} / '
        'labourProductivity=${latest['labourProductivity'] ?? '-'} / '
        'profitPerEmployee=${latest['profitPerEmployee'] ?? '-'} / '
        'averageGrossWage=${latest['averageGrossWage'] ?? '-'}',
      );
    } else {
      print('${company.name}: $dataStatus');
    }
  }

  final output = {
    'updated': DateTime.now().toIso8601String(),
    'source': {
      'emtaOpenDataPage': emtaOpenDataPage,
      'files': csvUrls,
      'note':
          'Quarterly data from the Estonian Tax and Customs Board. '
          'taxableTurnover, stateTaxes, labourTaxes and employees use '
          'EMTA values when available. taxableTurnoverPerEmployee uses '
          'the Inforegister value when available and otherwise is calculated. '
          'Additional quarterly indicators are parsed from public Inforegister '
          'company pages; 2020-2021 are also supplemented there when available.',
      'inforegisterMetrics': [
        'projectedTurnover',
        'projectedLabourProductivity',
        'labourProductivity',
        'profitPerEmployee',
        'averageGrossWage',
      ],
      'targetYearRange': '2015-2026',
    },
    'companies': result,
  };

  await File(outputFile).writeAsString(
    const JsonEncoder.withIndent('  ').convert(output),
    encoding: utf8,
  );

  final companiesWithData = result
      .where((company) => company['history'] is List &&
          (company['history'] as List).isNotEmpty)
      .length;

  print('\nCreated: $outputFile');
  print('Companies with quarterly data: $companiesWithData / ${companies.length}');
  print('=== Finished ===');
}

// ------------------------------------------------------------
// EMTA SOURCE DISCOVERY
// ------------------------------------------------------------

Future<List<String>> findEmtaCsvUrls() async {
  final response = await http.get(Uri.parse(emtaOpenDataPage));

  if (response.statusCode != 200) {
    throw Exception(
      'EMTA page download failed: HTTP ${response.statusCode}\n'
      '$emtaOpenDataPage',
    );
  }

  final html = utf8.decode(response.bodyBytes, allowMalformed: true);

  final urls = <String>{};

  // EMTA currently publishes two CSV files for this dataset:
  // current/previous years and earlier years. The file names/paths can
  // change when EMTA republishes the data, so discover them from the page.
  final pattern = RegExp(
    r'''https?://[^"\'<>\s]+\.csv[^"\'<>\s]*''',
    caseSensitive: false,
  );

  for (final match in pattern.allMatches(html)) {
    var url = match.group(0)!;
    url = url.replaceAll('&amp;', '&');

    if (url.toLowerCase().contains('tasutud_maksud')) {
      urls.add(url);
    }
  }

  // Some CMS pages put the URL into HTML attributes after escaping it.
  // Also tolerate protocol-relative links.
  final escapedPattern = RegExp(
    r'''(?:(?:https?:)?//)[^"\'<>\s]+tasutud_maksud[^"\'<>\s]+\.csv''',
    caseSensitive: false,
  );

  for (final match in escapedPattern.allMatches(html)) {
    var url = match.group(0)!;
    url = url.replaceAll('&amp;', '&');
    if (url.startsWith('//')) {
      url = 'https:$url';
    }
    urls.add(url);
  }

  return urls.toList()..sort();
}

Future<List<int>> downloadFile(String url) async {
  final response = await http.get(Uri.parse(url));

  if (response.statusCode != 200) {
    throw Exception(
      'Download failed: HTTP ${response.statusCode}\n$url',
    );
  }

  return response.bodyBytes;
}

// ------------------------------------------------------------
// CSV READER
// ------------------------------------------------------------

Map<String, List<QuarterRecord>> readQuarterlyCsv(
  List<int> bytes,
  Set<String> wantedCodes,
) {
  final text = utf8.decode(bytes, allowMalformed: true);
  final lines = const LineSplitter().convert(text);

  if (lines.isEmpty) {
    throw Exception('Quarterly CSV is empty');
  }

  // EMTA quarterly CSV is a WIDE table:
  // one company/year row contains separate columns for Q1-Q4.
  final header = parseCsvLine(lines.first);
  final columns = normalizeColumns(header);

  print('\nQuarterly CSV columns:');
  for (var i = 0; i < columns.length; i++) {
    print('$i: ${columns[i]}');
  }

  final registryIndex = findColumn(columns, [
    'registry code',
    'registry_code',
    'registrycode',
    'registrikood',
  ]);

  final yearIndex = findColumn(columns, [
    'year',
    'aasta',
    'report year',
    'report_year',
  ]);

  // Q1-Q4 are separate columns in the EMTA file.
  // EMTA names the quarters with Roman numerals: I, II, III, IV.
  final quarterLabels = <int, String>{
    1: 'i',
    2: 'ii',
    3: 'iii',
    4: 'iv',
  };

  final stateTaxes = <int, int>{};
  final labourTaxes = <int, int>{};
  final turnover = <int, int>{};
  final employees = <int, int>{};

  for (var q = 1; q <= 4; q++) {
    final label = quarterLabels[q]!;

    stateTaxes[q] = findColumn(columns, [
      'state taxes $label qtr',
      'state taxes $q qtr',
      'state taxes q$q',
      'state_taxes_$q',
    ]) ?? -1;

    labourTaxes[q] = findColumn(columns, [
      'labour taxes and payments $label qtr',
      'labour taxes and payments $q qtr',
      'labour taxes $label qtr',
      'labour taxes $q qtr',
      'labour_taxes_$q',
    ]) ?? -1;

    turnover[q] = findColumn(columns, [
      'turnover $label qtr',
      'turnover $q qtr',
      'taxable turnover $label qtr',
      'taxable turnover $q qtr',
      'turnover_q$q',
    ]) ?? -1;

    employees[q] = findColumn(columns, [
      'number of employees $label qtr',
      'number of employees $q qtr',
      'employees $label qtr',
      'employees $q qtr',
      'employees_q$q',
    ]) ?? -1;
  }

  if (registryIndex == null || yearIndex == null) {
    throw Exception(
      'Could not identify required quarterly columns.\n'
      'Registry: $registryIndex\n'
      'Year: $yearIndex\n'
      'See the printed column list above.',
    );
  }

  for (var q = 1; q <= 4; q++) {
    if (turnover[q] == -1 || employees[q] == -1) {
      throw Exception(
        'Could not identify turnover/employees columns for Q$q.\n'
        'Turnover Q$q: ${turnover[q]}\n'
        'Employees Q$q: ${employees[q]}',
      );
    }
  }

  final result = <String, List<QuarterRecord>>{};

  for (var lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    final line = lines[lineIndex];
    if (line.trim().isEmpty) continue;

    final row = parseCsvLine(line);

    if (row.length <= registryIndex || row.length <= yearIndex) {
      continue;
    }

    final registryCode = clean(row[registryIndex]);
    if (!wantedCodes.contains(registryCode)) continue;

    final year = parseYear(row[yearIndex]);
    if (year == null) continue;

    for (var q = 1; q <= 4; q++) {
      double? valueAt(Map<int, int> indexes) {
        final index = indexes[q] ?? -1;
        if (index < 0 || row.length <= index) return null;
        return parseNumber(row[index]);
      }

      final qTurnover = valueAt(turnover);
      final qStateTaxes = valueAt(stateTaxes);
      final qLabourTaxes = valueAt(labourTaxes);
      final qEmployees = valueAt(employees);

      // Skip completely empty quarters.
      if (qTurnover == null &&
          qStateTaxes == null &&
          qLabourTaxes == null &&
          qEmployees == null) {
        continue;
      }

      final nameIndex = findColumn(columns, [
        'name',
        'company name',
        'company_name',
        'nimi',
      ]);

      final record = QuarterRecord(
        year: year,
        quarter: q,
        taxableTurnover: qTurnover,
        stateTaxes: qStateTaxes,
        labourTaxes: qLabourTaxes,
        employees: qEmployees,
        sourceName: nameIndex != null && row.length > nameIndex
            ? clean(row[nameIndex])
            : null,
      );

      result.putIfAbsent(registryCode, () => []).add(record);
    }
  }

  return result;
}

List<dynamic> parseCsvLine(String line) {
  // EMTA quarterly open-data CSV is comma-delimited. Keep parsing strings here;
  // numbers are normalized by parseNumber().
  return const CsvToListConverter(
    fieldDelimiter: ',',
    eol: '\n',
    shouldParseNumbers: false,
  ).convert(line).first;
}

List<String> normalizeColumns(List<dynamic> row) {
  return row.map((e) {
    return clean(e).toLowerCase();
  }).toList();
}

int? findColumn(List<String> columns, List<String> names) {
  for (final name in names) {
    final index = columns.indexOf(name.toLowerCase());
    if (index >= 0) return index;
  }
  return null;
}

String clean(dynamic value) {
  return value
      .toString()
      .trim()
      .replaceAll('\uFEFF', '')
      .replaceAll('"', '');
}

int? parseYear(dynamic value) {
  final text = clean(value);
  final match = RegExp(r'(19|20)\d{2}').firstMatch(text);
  if (match == null) return null;
  return int.tryParse(match.group(0)!);
}

int? parseQuarter(dynamic value) {
  final text = clean(value).toLowerCase();

  if (RegExp(r'\bq\s*1\b').hasMatch(text) ||
      RegExp(r'\b1\s*(st|quarter)\b').hasMatch(text) ||
      RegExp(r'\bi\s*(quarter|kvartal)\b').hasMatch(text) ||
      text == '1') {
    return 1;
  }

  if (RegExp(r'\bq\s*2\b').hasMatch(text) ||
      RegExp(r'\b2\s*(nd|quarter)\b').hasMatch(text) ||
      RegExp(r'\bii\s*(quarter|kvartal)\b').hasMatch(text) ||
      text == '2') {
    return 2;
  }

  if (RegExp(r'\bq\s*3\b').hasMatch(text) ||
      RegExp(r'\b3\s*(rd|quarter)\b').hasMatch(text) ||
      RegExp(r'\biii\s*(quarter|kvartal)\b').hasMatch(text) ||
      text == '3') {
    return 3;
  }

  if (RegExp(r'\bq\s*4\b').hasMatch(text) ||
      RegExp(r'\b4\s*(th|quarter)\b').hasMatch(text) ||
      RegExp(r'\biv\s*(quarter|kvartal)\b').hasMatch(text) ||
      text == '4') {
    return 4;
  }

  return null;
}

({int? year, int? quarter}) parseQuarterPeriod(dynamic value) {
  final text = clean(value).toLowerCase();

  final yearMatch = RegExp(r'(19|20)\d{2}').firstMatch(text);
  final year = yearMatch == null
      ? null
      : int.tryParse(yearMatch.group(0)!);

  final quarter = parseQuarter(text);

  return (year: year, quarter: quarter);
}

double? parseNumber(dynamic value) {
  var text = clean(value);

  if (text.isEmpty) return null;

  // Normalize formats used by EMTA and Inforegister.
  text = text
      .replaceAll('\u00A0', ' ')
      .replaceAll('€', '')
      .replaceAll('%', '')
      .replaceAll('−', '-')
      .replaceAll('–', '-')
      .replaceAll('—', '-')
      .trim();

  if (text.isEmpty ||
      text == '-' ||
      text.toLowerCase() == 'null' ||
      text.toLowerCase() == 'n/a') {
    return null;
  }

  var negative = false;
  if (text.startsWith('(') && text.endsWith(')')) {
    negative = true;
    text = text.substring(1, text.length - 1).trim();
  }

  text = text.replaceAll(' ', '');

  final hasComma = text.contains(',');
  final hasDot = text.contains('.');

  if (hasComma && hasDot) {
    if (text.lastIndexOf(',') > text.lastIndexOf('.')) {
      text = text.replaceAll('.', '').replaceAll(',', '.');
    } else {
      text = text.replaceAll(',', '');
    }
  } else if (hasComma) {
    text = text.replaceAll(',', '.');
  }

  final number = double.tryParse(text);
  if (number == null) return null;

  return negative ? -number : number;
}

// ------------------------------------------------------------
// INFOREGISTER QUARTERLY ENRICHMENT
// ------------------------------------------------------------

Future<void> enrichFromInforegister(
  List<Company> companies,
  Map<String, List<QuarterRecord>> quarterly,
) async {
  var success = 0;
  var missing = 0;
  var mergedRecords = 0;

  for (final company in companies) {
    try {
      final url = inforegisterUrl(company);
      print('  ${company.name}');

      final response = await http
          .get(
            Uri.parse(url),
            headers: {
              'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                  'AppleWebKit/537.36 Chrome/154.0 Safari/537.36',
              'Accept':
                  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'et,en;q=0.8',
              'Cache-Control': 'no-cache',
            },
          )
          .timeout(const Duration(seconds: 20));

      if (response.statusCode != 200) {
        print('    Inforegister HTTP ${response.statusCode}');
        missing++;
        continue;
      }

      final html = utf8.decode(response.bodyBytes, allowMalformed: true);

      print('    HTML length: ${html.length}');
      print(
        '    Has quarterly heading: '
        '${html.toLowerCase().contains('kvartaalsed finantsnäitajad')}',
      );
      print('    HTML table count: ${countHtmlTables(html)}');

      final inforegisterRecords = parseInforegisterQuarterly(html);

      print(
        '    Parsed Inforegister quarters: '
        '${inforegisterRecords.length}',
      );

      if (inforegisterRecords.isEmpty) {
        missing++;
        continue;
      }

      var added = 0;
      var enriched = 0;

      for (final irRecord in inforegisterRecords) {
        if (irRecord.year < 2015 || irRecord.year > 2026) continue;

        final list = quarterly.putIfAbsent(
          company.registryCode,
          () => [],
        );

        final index = list.indexWhere(
          (existing) =>
              existing.year == irRecord.year &&
              existing.quarter == irRecord.quarter,
        );

        if (index < 0) {
          list.add(irRecord);
          added++;
        } else {
          list[index] = mergeQuarterRecord(
            list[index],
            irRecord,
          );
          enriched++;
        }
      }

      if (added > 0 || enriched > 0) {
        success++;
        mergedRecords += added + enriched;
        print(
          '    Inforegister: $added added, $enriched enriched',
        );
      } else {
        missing++;
        print('    No usable 2020-2026 records found');
      }
    } catch (error) {
      missing++;
      print('    Failed: $error');
    }
  }

  print(
    'Inforegister enrichment finished: $success companies processed, '
    '$mergedRecords quarterly records merged/added, '
    '$missing without usable Inforegister data.',
  );
}

QuarterRecord mergeQuarterRecord(
  QuarterRecord existing,
  QuarterRecord extra,
) {
  final taxableTurnover =
      existing.taxableTurnover ?? extra.taxableTurnover;
  final employees = existing.employees ?? extra.employees;

  return QuarterRecord(
    year: existing.year,
    quarter: existing.quarter,
    taxableTurnover: taxableTurnover,
    stateTaxes: existing.stateTaxes ?? extra.stateTaxes,
    labourTaxes: existing.labourTaxes ?? extra.labourTaxes,
    employees: employees,
    taxableTurnoverPerEmployee:
        existing.taxableTurnoverPerEmployee ??
            calculateTurnoverPerEmployee(
              taxableTurnover,
              employees,
            ),
    projectedTurnover:
        existing.projectedTurnover ?? extra.projectedTurnover,
    projectedLabourProductivity:
        existing.projectedLabourProductivity ??
            extra.projectedLabourProductivity,
    labourProductivity:
        existing.labourProductivity ?? extra.labourProductivity,
    profitPerEmployee:
        existing.profitPerEmployee ?? extra.profitPerEmployee,
    averageGrossWage:
        existing.averageGrossWage ?? extra.averageGrossWage,
    sourceName: existing.sourceName ?? extra.sourceName,
  );
}

String inforegisterUrl(Company company) {
  var slug = company.name.toUpperCase();

  const replacements = <String, String>{
    'Ä': 'A',
    'Ö': 'O',
    'Ü': 'U',
    'Õ': 'O',
    'Š': 'S',
    'Ž': 'Z',
    'Å': 'A',
    'Æ': 'AE',
    'Ø': 'O',
  };

  replacements.forEach((from, to) {
    slug = slug.replaceAll(from, to);
  });

  slug = slug
      .replaceAll(RegExp(r'[^A-Z0-9]+'), '-')
      .replaceAll(RegExp(r'-+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');

  return 'https://www.inforegister.ee/'
      '${company.registryCode}-$slug/';
}

List<QuarterRecord> parseInforegisterQuarterly(String html) {
  final financialTables = <List<List<String>>>[];
  final employeeTables = <List<List<String>>>[];

  for (final table in extractHtmlTables(html)) {
    final headerText = table
        .take(3)
        .expand((row) => row)
        .join(' | ')
        .toLowerCase();

    if (headerText.contains('prognoositud käive') &&
        headerText.contains('maksustatud käive') &&
        headerText.contains('tööjõu tootlikkus')) {
      financialTables.add(table);
    }

    if (headerText.contains('töötajaid') &&
        headerText.contains('käive töötaja kohta') &&
        headerText.contains('kasum töötaja kohta') &&
        headerText.contains('keskmine brutopalk')) {
      employeeTables.add(table);
    }
  }

  print('    Matching financial tables: ${financialTables.length}');
  print('    Matching employee tables: ${employeeTables.length}');

  final financial = <String, _InforegisterFinancial>{};
  final employeeData = <String, _InforegisterEmployee>{};

  for (final table in financialTables) {
    for (var rowIndex = 0; rowIndex < table.length; rowIndex++) {
      final row = table[rowIndex];
      if (row.isEmpty) continue;

      final period = parseInforegisterPeriod(row.first);
      if (period == null) continue;
      if (period.year < 2015 || period.year > 2026) continue;
      if (row.length < 7) continue;

      final key = '${period.year}-Q${period.quarter}';

      financial[key] = _InforegisterFinancial(
        year: period.year,
        quarter: period.quarter,
        projectedTurnover: parseNumber(row[1]),
        taxableTurnover: parseNumber(row[2]),
        stateTaxes: parseNumber(row[3]),
        labourTaxes: parseNumber(row[4]),
        projectedLabourProductivity: parseNumber(row[5]),
        labourProductivity: parseNumber(row[6]),
      );
    }
  }

  for (final table in employeeTables) {
    for (var rowIndex = 0; rowIndex < table.length; rowIndex++) {
      final row = table[rowIndex];
      if (row.isEmpty) continue;

      final period = parseInforegisterPeriod(row.first);
      if (period == null) continue;
      if (period.year < 2015 || period.year > 2026) continue;
      if (row.length < 5) continue;

      final key = '${period.year}-Q${period.quarter}';

      employeeData[key] = _InforegisterEmployee(
        year: period.year,
        quarter: period.quarter,
        employees: parseNumber(row[1]),
        profitPerEmployee: parseNumber(row[3]),
        averageGrossWage: parseNumber(row[4]),
      );
    }
  }

  final recordsByKey = <String, QuarterRecord>{};

  for (final entry in financial.entries) {
    final employee = employeeData[entry.key];
    final item = entry.value;

    recordsByKey[entry.key] = QuarterRecord(
      year: item.year,
      quarter: item.quarter,
      taxableTurnover: item.taxableTurnover,
      stateTaxes: item.stateTaxes,
      labourTaxes: item.labourTaxes,
      employees: employee?.employees,
      projectedTurnover: item.projectedTurnover,
      projectedLabourProductivity: item.projectedLabourProductivity,
      labourProductivity: item.labourProductivity,
      profitPerEmployee: employee?.profitPerEmployee,
      averageGrossWage: employee?.averageGrossWage,
      sourceName: null,
    );
  }

  for (final entry in employeeData.entries) {
    if (recordsByKey.containsKey(entry.key)) continue;

    final item = entry.value;

    recordsByKey[entry.key] = QuarterRecord(
      year: item.year,
      quarter: item.quarter,
      taxableTurnover: null,
      stateTaxes: null,
      labourTaxes: null,
      employees: item.employees,
      projectedTurnover: null,
      projectedLabourProductivity: null,
      labourProductivity: null,
      profitPerEmployee: item.profitPerEmployee,
      averageGrossWage: item.averageGrossWage,
      sourceName: null,
    );
  }

  return recordsByKey.values.toList();
}

int countHtmlTables(String html) {
  return RegExp(
    r'<table\b',
    caseSensitive: false,
  ).allMatches(html).length;
}

List<List<String>> _parseHtmlTable(String tableHtml) {
  final rows = <List<String>>[];

  final rowRegex = RegExp(
    r'<tr\b[^>]*>([\s\S]*?)</tr\s*>',
    caseSensitive: false,
  );

  final cellRegex = RegExp(
    r'<t[dh]\b[^>]*>([\s\S]*?)</t[dh]\s*>',
    caseSensitive: false,
  );

  for (final rowMatch in rowRegex.allMatches(tableHtml)) {
    final rowHtml = rowMatch.group(1) ?? '';
    final cells = <String>[];

    for (final cellMatch in cellRegex.allMatches(rowHtml)) {
      cells.add(cleanHtmlCell(cellMatch.group(1) ?? ''));
    }

    if (cells.isNotEmpty) rows.add(cells);
  }

  return rows;
}

List<List<List<String>>> extractHtmlTables(String html) {
  final tables = <List<List<String>>>[];

  final tableRegex = RegExp(
    r'<table\b[^>]*>([\s\S]*?)</table\s*>',
    caseSensitive: false,
  );

  for (final match in tableRegex.allMatches(html)) {
    final table = _parseHtmlTable(match.group(1) ?? '');
    if (table.isNotEmpty) tables.add(table);
  }

  return tables;
}

String cleanHtmlCell(String value) {
  var text = value;

  text = text.replaceAll(
    RegExp(r'<br\s*/?>', caseSensitive: false),
    ' ',
  );
  text = text.replaceAll(RegExp(r'<[^>]+>'), ' ');
  text = decodeBasicHtmlEntities(text);
  text = text.replaceAll(RegExp(r'\s+'), ' ').trim();

  return text;
}

({int year, int quarter})? parseInforegisterPeriod(String value) {
  var text = value.trim().toUpperCase();
  text = text.replaceAll(RegExp(r'[\u00A0]+'), ' ');
  text = text.replaceAll(RegExp(r'\s+'), ' ');

  var match = RegExp(
    r'^(20\d{2})\s+(IV|III|II|I)$',
  ).firstMatch(text);

  if (match != null) {
    final quarter = switch (match.group(2)) {
      'I' => 1,
      'II' => 2,
      'III' => 3,
      'IV' => 4,
      _ => null,
    };

    if (quarter != null) {
      return (
        year: int.parse(match.group(1)!),
        quarter: quarter,
      );
    }
  }

  match = RegExp(
    r'^(20\d{2})\s+Q([1-4])$',
  ).firstMatch(text);

  if (match != null) {
    return (
      year: int.parse(match.group(1)!),
      quarter: int.parse(match.group(2)!),
    );
  }

  match = RegExp(
    r'^(20\d{2})\s+([1-4])$',
  ).firstMatch(text);

  if (match != null) {
    return (
      year: int.parse(match.group(1)!),
      quarter: int.parse(match.group(2)!),
    );
  }

  return null;
}

String htmlToTabularText(String html) {
  var text = html;

  text = text.replaceAll(
    RegExp(r'<script[\s\S]*?</script>', caseSensitive: false),
    '',
  );
  text = text.replaceAll(
    RegExp(r'<style[\s\S]*?</style>', caseSensitive: false),
    '',
  );

  text = text.replaceAll(
    RegExp(r'<br\s*/?>', caseSensitive: false),
    '\n',
  );
  text = text.replaceAll(
    RegExp(r'</tr\s*>', caseSensitive: false),
    '\n',
  );
  text = text.replaceAll(
    RegExp(r'</t[dh]\s*>', caseSensitive: false),
    '\t',
  );
  text = text.replaceAll(RegExp(r'<[^>]+>'), '');

  return decodeBasicHtmlEntities(text);
}

String decodeBasicHtmlEntities(String value) {
  return value
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&#160;', ' ')
      .replaceAll('&euro;', '€')
      .replaceAll('&#8364;', '€')
      .replaceAll('&ndash;', '–')
      .replaceAll('&#8211;', '–')
      .replaceAll('&mdash;', '—')
      .replaceAll('&#8212;', '—')
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'");
}



class _InforegisterFinancial {
  final int year;
  final int quarter;
  final double? projectedTurnover;
  final double? taxableTurnover;
  final double? stateTaxes;
  final double? labourTaxes;
  final double? projectedLabourProductivity;
  final double? labourProductivity;

  _InforegisterFinancial({
    required this.year,
    required this.quarter,
    required this.projectedTurnover,
    required this.taxableTurnover,
    required this.stateTaxes,
    required this.labourTaxes,
    required this.projectedLabourProductivity,
    required this.labourProductivity,
  });
}

class _InforegisterEmployee {
  final int year;
  final int quarter;
  final double? employees;
  final double? profitPerEmployee;
  final double? averageGrossWage;

  _InforegisterEmployee({
    required this.year,
    required this.quarter,
    required this.employees,
    required this.profitPerEmployee,
    required this.averageGrossWage,
  });
}

// ------------------------------------------------------------
// COMPANIES YAML
// ------------------------------------------------------------

Future<List<Company>> loadCompanies(String filename) async {
  final file = File(filename);

  if (!await file.exists()) {
    throw Exception('$filename not found');
  }

  final text = await file.readAsString();
  final yaml = loadYaml(text);

  final result = <Company>[];

  for (final item in yaml['companies']) {
    result.add(
      Company(
        name: item['name'].toString(),
        registryCode: item['registry_code'].toString(),
        website: item['website']?.toString(),
        note: item['note']?.toString(),
      ),
    );
  }

  return result;
}

class Company {
  final String name;
  final String registryCode;
  final String? website;
  final String? note;

  Company({
    required this.name,
    required this.registryCode,
    this.website,
    this.note,
  });
}

class QuarterRecord {
  final int year;
  final int quarter;
  final double? taxableTurnover;
  final double? stateTaxes;
  final double? labourTaxes;
  final double? employees;
  final double? taxableTurnoverPerEmployee;
  final double? projectedTurnover;
  final double? projectedLabourProductivity;
  final double? labourProductivity;
  final double? profitPerEmployee;
  final double? averageGrossWage;
  final String? sourceName;

  QuarterRecord({
    required this.year,
    required this.quarter,
    required this.taxableTurnover,
    required this.stateTaxes,
    required this.labourTaxes,
    required this.employees,
    this.taxableTurnoverPerEmployee,
    this.projectedTurnover,
    this.projectedLabourProductivity,
    this.labourProductivity,
    this.profitPerEmployee,
    this.averageGrossWage,
    required this.sourceName,
  });

  Map<String, dynamic> toJson() {
    return {
      'year': year,
      'quarter': quarter,
      'period': '$year-Q$quarter',
      'taxableTurnover': taxableTurnover,
      'stateTaxes': stateTaxes,
      'labourTaxes': labourTaxes,
      'employees': employees,
      // Actual taxable turnover per employee. Inforegister's
      // 'Käive töötaja kohta' follows projected turnover/productivity
      // and is therefore not used for this field.
      'taxableTurnoverPerEmployee':
          taxableTurnoverPerEmployee ??
              calculateTurnoverPerEmployee(
                taxableTurnover,
                employees,
              ),
      'projectedTurnover': projectedTurnover,
      'projectedLabourProductivity': projectedLabourProductivity,
      'labourProductivity': labourProductivity,
      'profitPerEmployee': profitPerEmployee,
      'averageGrossWage': averageGrossWage,
      // Kept only for diagnostics; frontend can ignore it.
      'sourceName': sourceName,
    };
  }
}

double? calculateTurnoverPerEmployee(
  double? turnover,
  double? employees,
) {
  if (turnover == null || employees == null || employees <= 0) {
    return null;
  }

  return turnover / employees;
}
