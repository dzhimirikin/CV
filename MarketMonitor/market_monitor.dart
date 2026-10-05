import 'dart:convert';
import 'dart:io';

import 'package:archive/archive.dart';
import 'package:csv/csv.dart';
import 'package:http/http.dart' as http;
import 'package:yaml/yaml.dart';

const generalDataUrl =
    'https://avaandmed.ariregister.rik.ee/sites/default/files/'
    '1.aruannete_yldandmed_kuni_31082026_0.zip';

// Key indicators for all years used by the market monitor.
// The files are RIK open-data annual-report datasets.
const indicatorUrls = <String>[
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2025_aruannete_elemendid_kuni_31082026_0.zip',
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2024_aruannete_elemendid_kuni_31082026_0.zip',
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2023_aruannete_elemendid_kuni_31082026_0.zip',
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2022_aruannete_elemendid_kuni_31082026_0.zip',
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2021_aruannete_elemendid_kuni_31082026_0.zip',
  'https://avaandmed.ariregister.rik.ee/sites/default/files/'
      '4.2020_aruannete_elemendid_kuni_31082026_0.zip',
];

const outputFile = 'companies.json';

Future<void> main() async {
  print('=== Market Monitor ===');

  final companies = await loadCompanies('companies.yaml');
  print('Companies in YAML: ${companies.length}');

  final wantedCodes = companies.map((c) => c.registryCode).toSet();

  // 1. General report data: registry code -> report_id/year/submission.
  print('\n[1/2] Downloading general report data...');
  final generalArchive = await downloadArchive(generalDataUrl);
  final generalCsv = firstCsv(generalArchive);

  print('General CSV: ${generalCsv.name}');
  print('Size: ${generalCsv.size} bytes');

  final reports = await readGeneralReports(
    generalCsv,
    wantedCodes,
  );

  print('Matching reports found: ${reports.length}');

  // 2. Key indicators: merge the 2025 through 2020 datasets.
  print('\n[2/2] Downloading key indicators (2025, 2024, 2023, 2022, 2021, 2020)...');

  final reportIds = reports.values
      .expand((list) => list)
      .map((r) => r.reportId)
      .toSet();

  final indicators = <String, Map<String, double>>{};

  for (final url in indicatorUrls) {
    print('\nDownloading indicators: $url');

    final indicatorArchive = await downloadArchive(url);
    final indicatorCsv = firstCsv(indicatorArchive);

    print('Indicators CSV: ${indicatorCsv.name}');
    print('Size: ${indicatorCsv.size} bytes');

    final part = await readIndicators(
      indicatorCsv,
      reportIds,
    );

    for (final entry in part.entries) {
      indicators.putIfAbsent(entry.key, () => {});
      indicators[entry.key]!.addAll(entry.value);
    }

    print('Matching reports in this dataset: ${part.length}');
  }

  print('Total reports with indicators: ${indicators.length}');

  // 3. Build history and select the latest report that actually
  // contains structured financial indicators.
  final result = <Map<String, dynamic>>[];

  for (final company in companies) {
    final companyReports = reports[company.registryCode] ?? [];

    companyReports.sort((a, b) {
      final byYear = b.year.compareTo(a.year);
      if (byYear != 0) return byYear;
      return b.submitted.compareTo(a.submitted);
    });

    final history = <Map<String, dynamic>>[];

    for (final report in companyReports) {
      final values = indicators[report.reportId];

      if (values == null || values.isEmpty) {
        continue;
      }

      history.add(
        buildFinancialRecord(report, values),
      );
    }

    Map<String, dynamic>? latest;
    String dataStatus;

    if (history.isNotEmpty) {
      latest = history.first;
      dataStatus = 'ok';
    } else if (companyReports.isNotEmpty) {
      latest = null;
      dataStatus = 'report_found_no_indicators';
    } else {
      latest = null;
      dataStatus = 'no_report';
    }

    result.add({
      'name': company.name,
      'registryCode': company.registryCode,
      'website': company.website,
      'note': company.note,
      'dataStatus': dataStatus,
      'latest': latest,
      'history': history,
    });

    if (latest != null) {
      print(
        '${company.name}: '
        '${latest['year']} / '
        'turnover=${latest['turnover'] ?? '-'} / '
        'equity=${latest['equity'] ?? '-'} / '
        'profit=${latest['profit'] ?? '-'} / '
        'employees=${latest['employees'] ?? '-'}',
      );
    } else {
      print(
        '${company.name}: $dataStatus',
      );
    }
  }

  final output = {
    'updated': DateTime.now().toIso8601String(),
    'source': {
      'generalReports': generalDataUrl,
      'keyIndicators': indicatorUrls,
    },
    'companies': result,
  };

  await File(outputFile).writeAsString(
    const JsonEncoder.withIndent('  ').convert(output),
    encoding: utf8,
  );

  print('\nCreated: $outputFile');
  print('=== Finished ===');
}

Map<String, dynamic> buildFinancialRecord(
  ReportInfo report,
  Map<String, double> values,
) {
  final turnover = values['Revenue'];
  final equity = values['Equity'];
  final profit = values['TotalAnnualPeriodProfitLoss'];
  final employees =
      values['AverageNumberOfEmployeesInFullTimeEquivalentUnits'];

  return {
    'reportId': report.reportId,
    'year': report.year,
    'submitted': report.submitted.toIso8601String(),
    'turnover': turnover,
    'equity': equity,
    'profit': profit,
    'employees': employees,
    'margin': calculateMargin(profit, turnover),
    'turnoverPerEmployee':
        calculateTurnoverPerEmployee(turnover, employees),
  };
}

Future<Archive> downloadArchive(String url) async {
  final response = await http.get(Uri.parse(url));

  if (response.statusCode != 200) {
    throw Exception(
      'Download failed: HTTP ${response.statusCode}\n$url',
    );
  }

  print('Downloaded: ${response.bodyBytes.length} bytes');

  return ZipDecoder().decodeBytes(response.bodyBytes);
}

ArchiveFile firstCsv(Archive archive) {
  for (final file in archive.files) {
    if (file.name.toLowerCase().endsWith('.csv')) {
      return file;
    }
  }

  throw Exception('CSV file not found in archive');
}

Future<List<String>> readFirstLines(
  List<int> bytes, {
  int count = 20,
}) async {
  final lines = <String>[];
  var start = 0;

  for (var i = 0; i < bytes.length && lines.length < count; i++) {
    if (bytes[i] == 10) {
      var line = utf8.decode(
        bytes.sublist(start, i),
        allowMalformed: true,
      );

      if (line.endsWith('\r')) {
        line = line.substring(0, line.length - 1);
      }

      lines.add(line);
      start = i + 1;
    }
  }

  return lines;
}

Future<Map<String, List<ReportInfo>>> readGeneralReports(
  ArchiveFile file,
  Set<String> wantedCodes,
) async {
  final bytes = file.content as List<int>;

  final lines = await readFirstLines(bytes, count: 1);
  if (lines.isEmpty) {
    throw Exception('General CSV is empty');
  }

  final header = parseCsvLine(lines.first);
  final columns = normalizeColumns(header);

  print('\nGeneral CSV columns:');
  for (var i = 0; i < columns.length; i++) {
    print('$i: ${columns[i]}');
  }

  final reportIdIndex = findColumn(columns, [
    'report_id',
    'reportid',
  ]);

  final registryIndex = findColumn(columns, [
    'registrikood',
    'registry_code',
    'registrycode',
  ]);

  final yearIndex = findColumn(columns, [
    'aruandeaasta',
    'report_year',
    'reportyear',
    'period_year',
    'year',
  ]);

  final submittedIndex = findColumn(columns, [
    'esitamise_aeg',
    'submission_date',
    'submissiondate',
    'submitted',
    'esitatud',
  ]);

  if (reportIdIndex == null ||
      registryIndex == null ||
      yearIndex == null) {
    throw Exception(
      'Could not identify required columns in general CSV.\n'
      'Need report_id, registry code and report year.',
    );
  }

  final result = <String, List<ReportInfo>>{};

  // Process one physical CSV line at a time.
  var start = 0;

  for (var i = 0; i <= bytes.length; i++) {
    final isEnd = i == bytes.length;
    final isLineEnd = !isEnd && bytes[i] == 10;

    if (!isEnd && !isLineEnd) continue;

    if (i > start) {
      var line = utf8.decode(
        bytes.sublist(start, i),
        allowMalformed: true,
      );

      if (line.endsWith('\r')) {
        line = line.substring(0, line.length - 1);
      }

      final row = parseCsvLine(line);

      if (row.length > registryIndex &&
          row.length > reportIdIndex &&
          row.length > yearIndex) {
        final registryCode = clean(row[registryIndex]);

        if (wantedCodes.contains(registryCode)) {
          final reportId = clean(row[reportIdIndex]);
          final year = parseYear(row[yearIndex]);

          if (reportId.isNotEmpty && year != null) {
            final submitted = submittedIndex != null &&
                    row.length > submittedIndex
                ? parseDate(row[submittedIndex])
                : DateTime(year, 12, 31);

            result.putIfAbsent(registryCode, () => []).add(
                  ReportInfo(
                    reportId: reportId,
                    year: year,
                    submitted: submitted,
                  ),
                );
          }
        }
      }
    }

    start = i + 1;
  }

  return result;
}

Future<Map<String, Map<String, double>>> readIndicators(
  ArchiveFile file,
  Set<String> reportIds,
) async {
  final bytes = file.content as List<int>;

  final first = await readFirstLines(bytes, count: 1);
  if (first.isEmpty) {
    throw Exception('Indicators CSV is empty');
  }

  final header = parseCsvLine(first.first);
  final columns = normalizeColumns(header);

  print('\nIndicators CSV columns:');
  for (var i = 0; i < columns.length; i++) {
    print('$i: ${columns[i]}');
  }

  final reportIdIndex = findColumn(columns, [
    'report_id',
    'reportid',
  ]);

  final elementNameIndex = findColumn(columns, [
    'elemendi_nimetus',
    'element_name',
    'elementname',
  ]);

  final valueIndex = findColumn(columns, [
    'vaartus',
    'value',
  ]);

  if (reportIdIndex == null ||
      elementNameIndex == null ||
      valueIndex == null) {
    throw Exception(
      'Could not identify required columns in indicators CSV.',
    );
  }

  final wantedElements = <String>{
    'Revenue',
    'Equity',
    'TotalAnnualPeriodProfitLoss',
    'AverageNumberOfEmployeesInFullTimeEquivalentUnits',
  };

  final result = <String, Map<String, double>>{};

  var start = 0;

  for (var i = 0; i <= bytes.length; i++) {
    final isEnd = i == bytes.length;
    final isLineEnd = !isEnd && bytes[i] == 10;

    if (!isEnd && !isLineEnd) continue;

    if (i > start) {
      var line = utf8.decode(
        bytes.sublist(start, i),
        allowMalformed: true,
      );

      if (line.endsWith('\r')) {
        line = line.substring(0, line.length - 1);
      }

      final row = parseCsvLine(line);

      if (row.length > reportIdIndex &&
          row.length > elementNameIndex &&
          row.length > valueIndex) {
        final reportId = clean(row[reportIdIndex]);

        if (!reportIds.contains(reportId)) {
          start = i + 1;
          continue;
        }

        final elementName = clean(row[elementNameIndex]);
        final value = parseNumber(row[valueIndex]);

        if (value != null && wantedElements.contains(elementName)) {
          result.putIfAbsent(reportId, () => {})[elementName] = value;
        }
      }
    }

    start = i + 1;
  }

  return result;
}

List<dynamic> parseCsvLine(String line) {
  return const CsvToListConverter(
    fieldDelimiter: ';',
    eol: '\n',
    shouldParseNumbers: false,
  ).convert(line).first;
}

List<String> normalizeColumns(List<dynamic> row) {
  return row.map((e) {
    return e
        .toString()
        .trim()
        .replaceAll('\uFEFF', '')
        .toLowerCase();
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
      .replaceAll('"', '');
}

int? parseYear(dynamic value) {
  final text = clean(value);

  final match = RegExp(r'(19|20)\d{2}').firstMatch(text);
  if (match == null) return null;

  return int.tryParse(match.group(0)!);
}

DateTime parseDate(dynamic value) {
  final text = clean(value);

  final parsed = DateTime.tryParse(text);
  if (parsed != null) return parsed;

  final match = RegExp(r'(\d{1,2})[./-](\d{1,2})[./-](\d{4})')
      .firstMatch(text);

  if (match != null) {
    return DateTime(
      int.parse(match.group(3)!),
      int.parse(match.group(2)!),
      int.parse(match.group(1)!),
    );
  }

  return DateTime(1900);
}

double? parseNumber(dynamic value) {
  var text = clean(value);

  if (text.isEmpty || text == 'null') return null;

  text = text.replaceAll(' ', '');

  // RIK values are normally decimal numbers with a dot.
  // Also tolerate comma decimal notation.
  text = text.replaceAll(',', '.');

  return double.tryParse(text);
}

double? calculateMargin(double? profit, double? turnover) {
  if (profit == null || turnover == null || turnover == 0) {
    return null;
  }

  return profit / turnover * 100;
}

double? calculateTurnoverPerEmployee(
  double? turnover,
  double? employees,
) {
  if (turnover == null || employees == null || employees == 0) {
    return null;
  }

  return turnover / employees;
}

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

class ReportInfo {
  final String reportId;
  final int year;
  final DateTime submitted;

  ReportInfo({
    required this.reportId,
    required this.year,
    required this.submitted,
  });
}
