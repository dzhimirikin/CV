(() => {
  "use strict";

  const monitor = document.getElementById("market-monitor");
  if (!monitor) return;

  const t = key => monitor.dataset[key] || "";

  const DATA_URL = monitor.dataset.dataFile || (
    window.location.pathname.includes("/MarketMonitor/")
      ? "companies_quarterly.json"
      : "MarketMonitor/companies_quarterly.json"
  );

  const yearSelect = document.getElementById("quarterlyYear");
  const quarterSelect = document.getElementById("quarterlyQuarter");
  const sortSelect = document.getElementById("quarterlySort");
  const directionSelect = document.getElementById("quarterlyDirection");
  const searchInput = document.getElementById("quarterlySearch");
  const body = document.getElementById("quarterlyBody");
  const status = document.getElementById("quarterlyStatus");
  const summaryButton = document.getElementById("marketQuarterlySummaryButton");
  let selectionContainer = document.getElementById("marketQuarterlySelection");
  let selectAllCheckbox = document.getElementById("marketQuarterlySelectAll");
  let selectAllLabel = document.getElementById("marketQuarterlySelectAllLabel");

  const SELECTION_KEY = "marketMonitorSelectedCompanies";
  let selectedCompanies = new Set();
  let hasSavedSelection = false;

  if (!yearSelect || !quarterSelect || !sortSelect || !directionSelect || !searchInput || !body || !status) return;

  let companies = [];

  const lang = ["en", "et", "ru"].includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "en";

  const euro = value => value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(value));

  const number = value => value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(value));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getMobileLabels() {
    const headerCells = document.querySelectorAll("#market-monitor .quarterly-table thead th");
    return [...headerCells].map(th =>
      th.textContent.trim().replace(/,\s*€/u, "")
    );
  }

  function getRecord(company, year, quarter) {
    const history = Array.isArray(company.history) ? company.history : [];
    return history.find(record =>
      Number(record.year) === Number(year) &&
      Number(record.quarter) === Number(quarter)
    ) || null;
  }

  function availableYears() {
    const years = new Set();
    companies.forEach(company => {
      (company.history || []).forEach(record => {
        if (record.year != null) years.add(Number(record.year));
      });
    });
    return [...years].sort((a, b) => b - a);
  }

  function availableQuarters(year) {
    const quarters = new Set();
    companies.forEach(company => {
      (company.history || []).forEach(record => {
        if (Number(record.year) === Number(year) && record.quarter != null) {
          quarters.add(Number(record.quarter));
        }
      });
    });
    return [...quarters].sort((a, b) => b - a);
  }

  function fillYears() {
    yearSelect.innerHTML = "";
    const years = availableYears();

    years.forEach(year => {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    });

    if (years.length > 0) yearSelect.value = String(years[0]);
    fillQuarters();
  }

  function fillQuarters() {
    const previousQuarter = quarterSelect.value;
    const year = Number(yearSelect.value);
    const quarters = availableQuarters(year);
    const prefix = t("quarterPrefix") || "Q";

    quarterSelect.innerHTML = "";

    quarters.forEach(quarter => {
      const option = document.createElement("option");
      option.value = String(quarter);
      option.textContent = `${prefix}${quarter}`;
      quarterSelect.appendChild(option);
    });

    if (previousQuarter && quarters.includes(Number(previousQuarter))) {
      quarterSelect.value = previousQuarter;
    } else if (quarters.length > 0) {
      quarterSelect.value = String(quarters[0]);
    }
  }


  function companyId(company) {
    return String(
      company.registryCode ||
      company.registry_code ||
      company.name ||
      ""
    );
  }

  function loadSelection() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SELECTION_KEY) || "null");
      if (Array.isArray(saved)) {
        selectedCompanies = new Set(saved.map(String));
        hasSavedSelection = true;
      }
    } catch (error) {
      selectedCompanies = new Set();
    }
  }

  function saveSelection() {
    const values = [...selectedCompanies];
    sessionStorage.setItem(SELECTION_KEY, JSON.stringify(values));
    window.dispatchEvent(new CustomEvent("market-monitor-selection-change", {
      detail: { selectedCompanies: values }
    }));
  }

  function ensureSelection() {
    const ids = companies.map(companyId).filter(Boolean);
    if (!hasSavedSelection) {
      selectedCompanies = new Set(ids);
      saveSelection();
      hasSavedSelection = true;
      return;
    }

    const valid = new Set(ids);
    selectedCompanies = new Set(
      [...selectedCompanies].filter(id => valid.has(id))
    );

    saveSelection();
  }

  function updateSelectAllState() {
    if (!selectAllCheckbox) return;

    const ids = companies.map(companyId).filter(Boolean);
    const allSelected = ids.length > 0 && ids.every(id => selectedCompanies.has(id));
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected && ids.some(id => selectedCompanies.has(id));

    if (selectAllLabel) {
      selectAllLabel.textContent = allSelected
        ? (t("summaryDeselectAll") || "Deselect all")
        : (t("summarySelectAll") || "Select all");
    }
  }

  function setupSelection() {
    if (!selectionContainer && summaryButton) {
      selectionContainer = document.createElement("div");
      selectionContainer.id = "marketQuarterlySelection";
      selectionContainer.className = "market-selection-action";
      selectionContainer.innerHTML = `
        <label class="market-selection-label">
          <input id="marketQuarterlySelectAll" type="checkbox" checked>
          <span id="marketQuarterlySelectAllLabel"></span>
        </label>
      `;
      summaryButton.parentElement.insertAdjacentElement("afterend", selectionContainer);
    }

    selectAllCheckbox = selectionContainer?.querySelector("#marketQuarterlySelectAll") || selectAllCheckbox;
    selectAllLabel = selectionContainer?.querySelector("#marketQuarterlySelectAllLabel") || selectAllLabel;

    if (!selectionContainer || !selectAllCheckbox) return;

    selectAllCheckbox.addEventListener("change", () => {
      clearActivePreset();
      const ids = companies.map(companyId).filter(Boolean);
      selectedCompanies = selectAllCheckbox.checked
        ? new Set(ids)
        : new Set();
      saveSelection();
      render();
    });

    body.addEventListener("change", event => {
      const checkbox = event.target.closest(".market-company-checkbox");
      if (!checkbox) return;

      clearActivePreset();
      const id = checkbox.dataset.companyId || "";
      if (checkbox.checked) selectedCompanies.add(id);
      else selectedCompanies.delete(id);

      saveSelection();
      updateSelectAllState();
    });

    updateSelectAllState();
  }



  function clearActivePreset() {
    sessionStorage.removeItem("marketMonitorSelectionPreset");
    updatePresetButtons("");
    window.dispatchEvent(new CustomEvent("market-monitor-preset-change", {
      detail: { preset: "" }
    }));
  }

  function updatePresetButtons(preset) {
    const buttons = selectionContainer?.querySelectorAll("[data-selection-preset]");
    if (!buttons) return;
    buttons.forEach(button => {
      const active = button.dataset.selectionPreset === preset;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setupSelectionPresetButtons() {
    if (!selectionContainer) return;
    const buttons = selectionContainer.querySelectorAll("[data-selection-preset]");
    if (!buttons.length) return;

    updatePresetButtons(sessionStorage.getItem("marketMonitorSelectionPreset") || "");

    buttons.forEach(button => {
      button.addEventListener("click", async () => {
        const preset = button.dataset.selectionPreset;
        if (!["Al", "Fe"].includes(preset)) return;
        buttons.forEach(item => item.disabled = true);
        try {
          const folder = window.location.pathname.includes("/MarketMonitor/") ? "" : "MarketMonitor/";
          const filename = preset === "Al" ? "selection_annual_al.json" : "selection_annual_fe.json";
          const response = await fetch(`${folder}${filename}`, { cache: "no-cache" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const parsed = await response.json();
          const imported = parsed && parsed.format === "market-monitor-company-selection" &&
            parsed.version === 1 && Array.isArray(parsed.selectedCompanies)
              ? parsed.selectedCompanies : null;
          if (!imported || imported.some(value =>
            typeof value !== "string" && typeof value !== "number"
          )) throw new Error("Invalid selection file");

          const available = new Set(companies.map(companyId).filter(Boolean));
          selectedCompanies = new Set(imported.map(String).filter(id => available.has(id)));
          hasSavedSelection = true;
          saveSelection();
          sessionStorage.setItem("marketMonitorSelectionPreset", preset);
          window.dispatchEvent(new CustomEvent("market-monitor-preset-change", { detail: { preset } }));
          updatePresetButtons(preset);
          render();
          updateSelectAllState();
        } catch (error) {
          console.error("Market Monitor selection preset:", error);
          window.alert(document.documentElement.lang === "ru"
            ? "Не удалось загрузить предвыборку. Проверьте JSON-файл в папке MarketMonitor."
            : document.documentElement.lang === "et"
              ? "Eelvalikut ei õnnestunud laadida. Kontrollige JSON-faili kaustas MarketMonitor."
              : "Could not load the preset. Check the JSON file in the MarketMonitor folder.");
        } finally {
          buttons.forEach(item => item.disabled = false);
        }
      });
    });

    window.addEventListener("market-monitor-preset-change", event => {
      updatePresetButtons(event.detail?.preset || "");
    });
  }

  function setupSharedSelectionSync() {
    window.addEventListener("market-monitor-selection-change", event => {
      if (!Array.isArray(event.detail?.selectedCompanies)) return;
      const available = new Set(companies.map(companyId).filter(Boolean));
      selectedCompanies = new Set(
        event.detail.selectedCompanies.map(String).filter(id => available.has(id))
      );
      hasSavedSelection = true;
      render();
      updateSelectAllState();
    });
  }


  function setupSelectionFileActions() {
    const exportButton = document.getElementById("marketQuarterlyExportSelection");
    const importButton = document.getElementById("marketQuarterlyImportSelection");
    const fileInput = document.getElementById("marketQuarterlyImportSelectionFile");
    if (!exportButton || !importButton || !fileInput) return;

    const messages = {
      en: {
        exported: "Selection exported.",
        imported: count => `Selection imported: ${count} companies selected.`,
        invalid: "This file is not a valid company selection file.",
        readError: "Could not read the selected file.",
        noCompanies: "No matching companies were found in this file."
      },
      et: {
        exported: "Valik eksporditud.",
        imported: count => `Valik imporditud: valitud ettevõtteid ${count}.`,
        invalid: "See fail ei ole kehtiv ettevõtete valiku fail.",
        readError: "Valitud faili ei õnnestunud lugeda.",
        noCompanies: "Failist ei leitud sobivaid ettevõtteid."
      },
      ru: {
        exported: "Выборка экспортирована.",
        imported: count => `Выборка импортирована: выбрано компаний — ${count}.`,
        invalid: "Это не файл корректной выборки компаний.",
        readError: "Не удалось прочитать выбранный файл.",
        noCompanies: "В файле не найдено подходящих компаний."
      }
    };
    const language = ["en", "et", "ru"].includes(document.documentElement.lang)
      ? document.documentElement.lang
      : "en";
    const message = messages[language];

    exportButton.addEventListener("click", event => {
      event.preventDefault();
      const payload = {
        format: "market-monitor-company-selection",
        version: 1,
        exportedAt: new Date().toISOString(),
        selectedCompanies: [...selectedCompanies]
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "market-monitor-quarterly-selection.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      window.alert(message.exported);
    });

    importButton.addEventListener("click", event => {
      event.preventDefault();
      fileInput.value = "";
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const imported = Array.isArray(parsed)
          ? parsed
          : parsed && parsed.format === "market-monitor-company-selection" &&
            parsed.version === 1 && Array.isArray(parsed.selectedCompanies)
              ? parsed.selectedCompanies
              : null;

        if (!imported || imported.some(value =>
          typeof value !== "string" && typeof value !== "number"
        )) {
          window.alert(message.invalid);
          return;
        }

        const available = new Set(companies.map(companyId).filter(Boolean));
        selectedCompanies = new Set(
          imported.map(value => String(value)).filter(id => available.has(id))
        );
        hasSavedSelection = true;
        saveSelection();
        render();
        updateSelectAllState();

        if (imported.length > 0 && selectedCompanies.size === 0) {
          window.alert(message.noCompanies);
        } else {
          window.alert(message.imported(selectedCompanies.size));
        }
      } catch (error) {
        window.alert(message.readError);
      } finally {
        fileInput.value = "";
      }
    });
  }


  function downloadCsv(filename, rows) {
    const csvCell = value => {
      const text = String(value ?? "");
      return /[,;"\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function setupCsvExport(modal, getYears, exportRange, getCurrent) {
    const saveButton = modal.querySelector(".market-summary-save-csv");
    const options = modal.querySelector(".market-csv-options");
    if (!saveButton || !options || saveButton.dataset.ready === "1") return;
    saveButton.dataset.ready = "1";

    const fromSelect = modal.querySelector(".market-csv-from");
    const toSelect = modal.querySelector(".market-csv-to");
    const yearsWrap = modal.querySelector(".market-csv-years");
    const radios = [...modal.querySelectorAll('input[name="marketCsvPeriod"]')];
    const downloadButton = modal.querySelector(".market-csv-download");
    const cancelButton = modal.querySelector(".market-csv-cancel");

    const lang = document.documentElement.lang || "en";
    const labels = {
      en: ["Save to CSV", "Choose the period to export", "Save current period", "Choose a year range", "From", "To", "Download CSV", "Cancel"],
      et: ["Salvesta CSV-na", "Vali ekspordi periood", "Salvesta praegune periood", "Vali aastate vahemik", "Alates", "Kuni", "Laadi CSV alla", "Tühista"],
      ru: ["Сохранить в CSV", "Выберите период для экспорта", "Сохранить текущий период", "Выбрать интервал лет", "С года", "По год", "Скачать CSV", "Отмена"]
    }[lang] || ["Save to CSV", "Choose the period to export", "Save current period", "Choose a year range", "From", "To", "Download CSV", "Cancel"];

    saveButton.textContent = labels[0];
    modal.querySelector(".market-csv-prompt").textContent = labels[1];
    modal.querySelector(".market-csv-current-label").textContent = labels[2];
    modal.querySelector(".market-csv-range-label").textContent = labels[3];
    modal.querySelector(".market-csv-from-label").textContent = labels[4];
    modal.querySelector(".market-csv-to-label").textContent = labels[5];
    downloadButton.textContent = labels[6];
    cancelButton.textContent = labels[7];

    const fillSelect = (select, years, selected) => {
      select.innerHTML = "";
      years.forEach(year => {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        select.appendChild(option);
      });
      if (years.includes(Number(selected))) select.value = String(selected);
    };
    const updateMode = () => {
      yearsWrap.hidden = radios.find(r => r.checked)?.value !== "range";
    };

    saveButton.addEventListener("click", () => {
      const years = [...new Set(getYears().map(Number))].sort((a, b) => a - b);
      if (!years.length) return;
      fillSelect(fromSelect, years, years[0]);
      fillSelect(toSelect, years, years[years.length - 1]);
      radios[0].checked = true;
      updateMode();
      options.hidden = !options.hidden;
    });
    radios.forEach(r => r.addEventListener("change", updateMode));
    cancelButton.addEventListener("click", () => { options.hidden = true; });

    downloadButton.addEventListener("click", () => {
      if (radios.find(r => r.checked)?.value !== "range") {
        const current = getCurrent();
        downloadCsv(`market-indicators-${current.filename}.csv`, current.rows);
        options.hidden = true;
        return;
      }
      let from = Number(fromSelect.value);
      let to = Number(toSelect.value);
      if (!Number.isFinite(from) || !Number.isFinite(to)) return;
      if (from > to) [from, to] = [to, from];
      const rows = [];
      getYears().map(Number).filter(y => y >= from && y <= to).sort((a,b) => a-b)
        .forEach(year => exportRange(year, rows));
      if (rows.length < 2) {
        alert("No data available for the selected period.");
        return;
      }
      downloadCsv(`market-indicators-${from}-${to}.csv`, rows);
      options.hidden = true;
    });
  }

  function currentSummaryCsvRows(modal, period) {
    const headers = [t("csvPeriod") || "Period"];
    const values = [period];
    modal.querySelectorAll(".market-summary-table tbody tr").forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (cells.length >= 2) {
        headers.push(cells[0].textContent.trim());
        values.push(cells[1].textContent.trim());
      }
    });
    return [headers, values];
  }

  function getSummaryModal() {
    let modal = document.getElementById("marketQuarterlySummaryModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "marketQuarterlySummaryModal";
    modal.className = "market-summary-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="market-summary-window" role="dialog" aria-modal="true" aria-labelledby="marketQuarterlySummaryTitle">
        <button type="button" class="market-summary-close" aria-label="${escapeHtml(t("summaryClose") || "Close")}">×</button>
        <h3 id="marketQuarterlySummaryTitle"></h3>
        <div class="market-summary-subtitle"></div>
        <div class="market-summary-table-wrap">
          <table class="market-summary-table">
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="market-summary-actions">
          <button type="button" class="cv-link market-summary-save-csv">Save to CSV</button>
        </div>
        <div class="market-csv-options" hidden>
          <p class="market-csv-prompt">Choose the period to export</p>
          <label class="market-csv-choice"><input type="radio" name="marketCsvPeriod" value="current" checked> <span class="market-csv-current-label">Save current period</span></label>
          <label class="market-csv-choice"><input type="radio" name="marketCsvPeriod" value="range"> <span class="market-csv-range-label">Choose a year range</span></label>
          <div class="market-csv-years" hidden>
            <label><span class="market-csv-from-label">From</span> <select class="market-csv-from"></select></label>
            <label><span class="market-csv-to-label">To</span> <select class="market-csv-to"></select></label>
          </div>
          <div class="market-csv-actions">
            <button type="button" class="cv-link market-csv-download">Download CSV</button>
            <button type="button" class="cv-link market-csv-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.hidden = true;
    };

    modal.querySelector(".market-summary-close").addEventListener("click", close);

    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) close();
    });

    return modal;
  }

  function showQuarterlySummary() {
    const year = Number(yearSelect.value);
    const quarter = Number(quarterSelect.value);
    const search = searchInput.value.trim().toLowerCase();

    const rows = companies
      .filter(company =>
        selectedCompanies.has(companyId(company)) &&
        String(company.name || "").toLowerCase().includes(search)
      )
      .map(company => ({
        company,
        record: getRecord(company, year, quarter)
      }))
      .filter(item => item.record != null);

    const sum = key => rows
      .filter(({ record }) => record?.[key] != null)
      .reduce((total, { record }) => total + Number(record[key] || 0), 0);

    const totalTurnover = sum("taxableTurnover");
    const totalProjectedTurnover = sum("projectedTurnover");
    const totalStateTaxes = sum("stateTaxes");
    const totalLabourTaxes = sum("labourTaxes");
    const totalEmployees = sum("employees");

    const profitRows = rows.filter(({ record }) =>
      record?.profitPerEmployee != null && record?.employees != null
    );

    const wageRows = rows.filter(({ record }) =>
      record?.averageGrossWage != null && record?.employees != null
    );

    const totalProfit = profitRows.reduce(
      (total, { record }) =>
        total + Number(record.profitPerEmployee) * Number(record.employees),
      0
    );

    const totalProfitEmployees = profitRows.reduce(
      (total, { record }) => total + Number(record.employees),
      0
    );

    const totalGrossWages = wageRows.reduce(
      (total, { record }) =>
        total + Number(record.averageGrossWage) * Number(record.employees),
      0
    );

    const totalWageEmployees = wageRows.reduce(
      (total, { record }) => total + Number(record.employees),
      0
    );

    const turnoverRows = rows.filter(({ record }) =>
      record?.taxableTurnover != null && record?.employees != null
    );

    const turnoverForPerEmployee = turnoverRows.reduce(
      (total, { record }) => total + Number(record.taxableTurnover),
      0
    );

    const employeesForTurnover = turnoverRows.reduce(
      (total, { record }) => total + Number(record.employees),
      0
    );

    const projectedRows = rows.filter(({ record }) =>
      record?.projectedTurnover != null && record?.employees != null
    );

    const projectedTurnoverForPerEmployee = projectedRows.reduce(
      (total, { record }) => total + Number(record.projectedTurnover),
      0
    );

    const employeesForProjected = projectedRows.reduce(
      (total, { record }) => total + Number(record.employees),
      0
    );

    const turnoverPerEmployee = employeesForTurnover
      ? turnoverForPerEmployee / employeesForTurnover
      : null;

    const projectedLabourProductivity = employeesForProjected
      ? projectedTurnoverForPerEmployee / employeesForProjected
      : null;

    const labourProductivity = turnoverPerEmployee;

    const profitPerEmployee = totalProfitEmployees
      ? totalProfit / totalProfitEmployees
      : null;

    const averageGrossWage = totalWageEmployees
      ? totalGrossWages / totalWageEmployees
      : null;

    const modal = getSummaryModal();
    const title = modal.querySelector("#marketQuarterlySummaryTitle");
    const subtitle = modal.querySelector(".market-summary-subtitle");
    const headerCells = modal.querySelectorAll("thead th");
    const tbody = modal.querySelector("tbody");

    const prefix = t("quarterPrefix") || "Q";

    title.textContent = t("summaryTitle") || "Market indicators";
    subtitle.textContent =
      `${year}-${prefix}${quarter} · ${rows.length} ${t("summaryCompanies") || "companies"}`;

    headerCells[0].textContent = t("summaryIndicator") || "Indicator";
    headerCells[1].textContent = t("summaryMarket") || "Market";

    const labels = [
      [t("summaryTurnover") || "Turnover, €", euro(totalTurnover), ""],
      [t("summaryProjectedTurnover") || "Projected turnover, €", euro(totalProjectedTurnover), ""],
      [t("summaryStateTaxes") || "State taxes, €", euro(totalStateTaxes), ""],
      [t("summaryLabourTaxes") || "Labour taxes, €", euro(totalLabourTaxes), ""],
      [t("summaryEmployees") || "Employees", number(totalEmployees), ""],
      [t("summaryTurnoverPerEmployee") || "Turnover / employee, €", euro(turnoverPerEmployee), ""],
      [t("summaryProjectedProductivity") || "Projected labour productivity, €", euro(projectedLabourProductivity), ""],
      [t("summaryProductivity") || "Labour productivity, €", euro(labourProductivity), ""],
      [
        t("summaryProfitPerEmployee") || "Profit / employee, €",
        euro(profitPerEmployee),
        profitPerEmployee > 0
          ? "market-summary-positive"
          : profitPerEmployee < 0
            ? "market-summary-negative"
            : ""
      ],
      [t("summaryAverageWage") || "Average gross wage, €", euro(averageGrossWage), ""]
    ];

    tbody.innerHTML = labels.map(([label, value, className]) =>
      `<tr><td>${escapeHtml(label)}</td><td class="${className || ""}">${escapeHtml(value)}</td></tr>`
    ).join("");

    setupCsvExport(modal, availableYears, (rangeYear, csvRows) => {
      const previousYear = yearSelect.value;
      const previousQuarter = quarterSelect.value;

      // The quarter selector is normally populated only with quarters available
      // for the currently selected year. During range export, however, the year
      // changes programmatically and its options are not refreshed. Ensure all
      // four quarter options exist so assigning Q3/Q4 cannot silently set value="".
      const quarterPrefix = t("quarterPrefix") || "Q";
      [1, 2, 3, 4].forEach(rangeQuarter => {
        if (![...quarterSelect.options].some(option => Number(option.value) === rangeQuarter)) {
          const option = document.createElement("option");
          option.value = String(rangeQuarter);
          option.textContent = `${quarterPrefix}${rangeQuarter}`;
          quarterSelect.appendChild(option);
        }
      });

      [1, 2, 3, 4].forEach(rangeQuarter => {
        yearSelect.value = String(rangeYear);
        quarterSelect.value = String(rangeQuarter);
        showQuarterlySummary();

        const reportModal = document.getElementById("marketQuarterlySummaryModal");
        const period = `${rangeYear}-Q${rangeQuarter}`;
        const reportRows = [...reportModal.querySelectorAll(".market-summary-table tbody tr")];
        const labels = reportRows.map(tr => tr.querySelectorAll("td")[0]?.textContent.trim() || "");
        const values = reportRows.map(tr => tr.querySelectorAll("td")[1]?.textContent.trim() || "");

        if (csvRows.length === 0) {
          csvRows.push([t("csvPeriod") || "Period", ...labels]);
        }
        csvRows.push([period, ...values]);
      });

      yearSelect.value = previousYear;
      quarterSelect.value = previousQuarter;
      showQuarterlySummary();
    }, () => {
      const period = modal.querySelector(".market-summary-subtitle").textContent.split("·")[0].trim();
      return { filename: period.toLowerCase().replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, ""),
        rows: currentSummaryCsvRows(modal, period) };
    });

    modal.hidden = false;
  }

  function sortValue(company, record) {
    switch (sortSelect.value) {
      case "taxableTurnover":
        return record?.taxableTurnover;
      case "projectedTurnover":
        return record?.projectedTurnover;
      case "stateTaxes":
        return record?.stateTaxes;
      case "labourTaxes":
        return record?.labourTaxes;
      case "employees":
        return record?.employees;
      case "taxableTurnoverPerEmployee":
        return record?.taxableTurnoverPerEmployee;
      case "projectedLabourProductivity":
        return record?.projectedLabourProductivity;
      case "labourProductivity":
        return record?.labourProductivity;
      case "profitPerEmployee":
        return record?.profitPerEmployee;
      case "averageGrossWage":
        return record?.averageGrossWage;
      case "name":
        return company.name || "";
      default:
        return record?.taxableTurnover;
    }
  }

  function turnoverClass(value) {
    if (value == null) return "quarterly-muted";
    if (Number(value) > 0) return "quarterly-positive";
    if (Number(value) < 0) return "quarterly-negative";
    return "";
  }

  function render() {
    const year = Number(yearSelect.value);
    const quarter = Number(quarterSelect.value);
    const search = searchInput.value.trim().toLowerCase();
    const mobileLabels = getMobileLabels();
    const prefix = t("quarterPrefix") || "Q";

    let rows = companies
      .filter(company =>
        String(company.name || "")
          .toLowerCase()
          .includes(search)
      )
      .map(company => ({
        company,
        record: getRecord(company, year, quarter)
      }));

    rows.sort((a, b) => {
      const av = sortValue(a.company, a.record);
      const bv = sortValue(b.company, b.record);

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (sortSelect.value === "name") {
        const result = String(av).localeCompare(
          String(bv),
          document.documentElement.lang || "en"
        );
        return directionSelect.value === "asc" ? result : -result;
      }

      const result = Number(av) - Number(bv);
      return directionSelect.value === "asc" ? result : -result;
    });

      const total = rows.length;

      body.innerHTML = rows.map(({ company, record }, index) => {
      const registryCode =
        company.registryCode ||
        company.registry_code ||
        "";

      const teatmikUrl = registryCode
        ? `https://www.teatmik.ee/${lang}/personlegal/${encodeURIComponent(
            registryCode
          )}`
        : "";

      const companyName = company.website
        ? `<a href="${escapeHtml(company.website)}"
              target="_blank"
              rel="noopener noreferrer"
              class="quarterly-company-name">${escapeHtml(
                company.name
              )}</a>`
        : `<span class="quarterly-company-name">${escapeHtml(
            company.name
          )}</span>`;

      const teatmik = teatmikUrl
        ? `<a href="${teatmikUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="quarterly-teatmik"
              title="TEATMIK"
              aria-label="TEATMIK">t</a>`
        : "";

      const label = index => escapeHtml(mobileLabels[index] || "");

      return `<tr>
        <td>
          <span class="quarterly-company-cell">
              <span class="company-selection">
                <input
                  type="checkbox"
                  class="market-company-checkbox"
                  data-company-id="${escapeHtml(companyId(company))}"
                  ${selectedCompanies.has(companyId(company)) ? "checked" : ""}
                  aria-label="${escapeHtml(company.name || "Company")}">
                <span class="company-rank">${index + 1}/${total}</span>
              </span>
              ${companyName}
              ${teatmik}
          </span>
        </td>
        <td data-label="${label(1)}">${record?.period ?? "—"}</td>
        <td class="${turnoverClass(record?.taxableTurnover)}" data-label="${label(2)}">${euro(record?.taxableTurnover)}</td>
        <td data-label="${label(3)}">${euro(record?.projectedTurnover)}</td>
        <td data-label="${label(4)}">${euro(record?.stateTaxes)}</td>
        <td data-label="${label(5)}">${euro(record?.labourTaxes)}</td>
        <td data-label="${label(6)}">${number(record?.employees)}</td>
        <td data-label="${label(7)}">${euro(record?.taxableTurnoverPerEmployee)}</td>
        <td data-label="${label(8)}">${euro(record?.projectedLabourProductivity)}</td>
        <td data-label="${label(9)}">${euro(record?.labourProductivity)}</td>
        <td data-label="${label(10)}">${euro(record?.profitPerEmployee)}</td>
        <td data-label="${label(11)}">${euro(record?.averageGrossWage)}</td>
      </tr>`;
    }).join("");

    const availableCount = rows.filter(item => item.record != null).length;

    status.textContent =
      `${t("statusCompanies") || "Companies"}: ${rows.length} · ` +
      `${t("statusWithData") || "With data"}: ${availableCount} · ` +
      `${t("statusPeriod") || "Period"}: ${year}-${prefix}${quarter}`;

    updateSelectAllState();
  }

  async function loadData() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      companies = Array.isArray(data.companies) ? data.companies : [];
      loadSelection();
      ensureSelection();
      updateSelectAllState();

      const updatedElement = document.getElementById("marketMonitorQuarterlyUpdated");
      if (updatedElement && data.updated) {
        const updated = String(data.updated).split(".")[0];
        updatedElement.textContent =
          `${updatedElement.dataset.prefix || "Updated"}: ${updated.replace("T", ", ")} UTC`;
      }

      fillYears();
      render();
    } catch (error) {
      console.error("Quarterly Market Monitor:", error);
      status.textContent =
        t("quarterlyLoadError") ||
        "Failed to load quarterly data.";

      body.innerHTML = `<tr>
        <td colspan="12" class="quarterly-error">
          ${escapeHtml(
            t("quarterlyCheckFile") ||
            "Please check the file companies_quarterly.json and make sure the page is running through a local HTTP server."
          )}
        </td>
      </tr>`;
    }
  }

  yearSelect.addEventListener("change", () => {
    fillQuarters();
    render();
  });

  quarterSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  directionSelect.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  if (summaryButton) {
    summaryButton.addEventListener("click", showQuarterlySummary);
  }

  setupSelection();
  setupSharedSelectionSync();
  setupSelectionPresetButtons();
  setupSelectionFileActions();
  loadData();
})();
