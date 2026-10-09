(() => {
  "use strict";

  const monitor = document.getElementById("market-monitor");
  if (!monitor) return;

  const t = key => monitor.dataset[key] || "";

  const DATA_URL = window.location.pathname.includes("/MarketMonitor/")
    ? "companies.json"
    : "MarketMonitor/companies.json";

  const yearSelect = document.getElementById("year");
  const sortSelect = document.getElementById("sort");
  const sortDirection = document.getElementById("sortDirection");
  const searchInput = document.getElementById("search");
  const body = document.getElementById("companiesBody");
  const status = document.getElementById("status");
  const summaryButton = document.getElementById("marketAnnualSummaryButton");
  let selectionContainer = document.getElementById("marketAnnualSelection");
  let selectAllCheckbox = document.getElementById("marketAnnualSelectAll");
  let selectAllLabel = document.getElementById("marketAnnualSelectAllLabel");

  const SELECTION_KEY = "marketMonitorSelectedCompanies";
  let selectedCompanies = new Set();
  let hasSavedSelection = false;

  if (!yearSelect || !sortSelect || !sortDirection || !searchInput || !body || !status) return;

  let companies = [];

  const euro = value => value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(value));

  const number = value => value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(Number(value));

  const percent = value => value == null ? "—" : `${Number(value).toFixed(1)}%`;

  function getRecord(company, year) {
    if (year === "latest") return company.latest || null;
    return (company.history || []).find(record => String(record.year) === String(year)) || null;
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

  function getMobileLabels() {
    const headerCells = document.querySelectorAll("#marketMonitorAnnual thead th");
    return [...headerCells].map(th => th.textContent.trim().replace(/,\s*€$/u, ""));
  }

  function fillYears() {
    yearSelect.innerHTML = "";
    const latest = document.createElement("option");
    latest.value = "latest";
    latest.textContent = t("statusLatest") || "Latest available";
    yearSelect.appendChild(latest);

    availableYears().forEach(year => {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    });
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
    sessionStorage.setItem(SELECTION_KEY, JSON.stringify([...selectedCompanies]));
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

    if (!selectedCompanies.size && ids.length) {
      selectedCompanies = new Set(ids);
    }
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
      selectionContainer.id = "marketAnnualSelection";
      selectionContainer.className = "market-selection-action";
      selectionContainer.innerHTML = `
        <label class="market-selection-label">
          <input id="marketAnnualSelectAll" type="checkbox" checked>
          <span id="marketAnnualSelectAllLabel"></span>
        </label>
      `;
      summaryButton.parentElement.insertAdjacentElement("afterend", selectionContainer);
    }

    selectAllCheckbox = selectionContainer?.querySelector("#marketAnnualSelectAll") || selectAllCheckbox;
    selectAllLabel = selectionContainer?.querySelector("#marketAnnualSelectAllLabel") || selectAllLabel;

    if (!selectionContainer || !selectAllCheckbox) return;

    selectAllCheckbox.addEventListener("change", () => {
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

      const id = checkbox.dataset.companyId || "";
      if (checkbox.checked) selectedCompanies.add(id);
      else selectedCompanies.delete(id);

      saveSelection();
      updateSelectAllState();
    });

    updateSelectAllState();
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
    const headers = [t("csvYear") || "Year"];
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
    let modal = document.getElementById("marketAnnualSummaryModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "marketAnnualSummaryModal";
    modal.className = "market-summary-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="market-summary-window" role="dialog" aria-modal="true" aria-labelledby="marketAnnualSummaryTitle">
        <button type="button" class="market-summary-close" aria-label="${escapeHtml(t("summaryClose") || "Close")}">×</button>
        <h3 id="marketAnnualSummaryTitle"></h3>
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

  function showAnnualSummary() {
    const year = yearSelect.value;
    const query = searchInput.value.trim().toLowerCase();

    const rows = companies
      .map(company => ({ company, record: getRecord(company, year) }))
      .filter(item =>
        selectedCompanies.has(companyId(item.company)) &&
        String(item.company.name || "").toLowerCase().includes(query) &&
        item.record != null
      );

    const sum = key => rows
      .filter(({ record }) => record?.[key] != null)
      .reduce((total, { record }) => total + Number(record[key] || 0), 0);

    const totalTurnover = sum("turnover");
    const totalEquity = sum("equity");
    const totalProfit = sum("profit");
    const totalEmployees = sum("employees");

    const turnoverEmployees = rows.filter(({ record }) =>
      record?.turnover != null && record?.employees != null
    );

    const profitEmployees = rows.filter(({ record }) =>
      record?.profit != null && record?.employees != null
    );

    const turnoverForPerEmployee = turnoverEmployees.reduce(
      (total, { record }) => total + Number(record.turnover || 0), 0
    );

    const employeesForTurnover = turnoverEmployees.reduce(
      (total, { record }) => total + Number(record.employees || 0), 0
    );

    const profitForPerEmployee = profitEmployees.reduce(
      (total, { record }) => total + Number(record.profit || 0), 0
    );

    const employeesForProfit = profitEmployees.reduce(
      (total, { record }) => total + Number(record.employees || 0), 0
    );

    const turnoverPerEmployee = employeesForTurnover
      ? turnoverForPerEmployee / employeesForTurnover
      : null;

    const profitPerEmployee = employeesForProfit
      ? profitForPerEmployee / employeesForProfit
      : null;

    const margin = totalTurnover
      ? (totalProfit / totalTurnover) * 100
      : null;

    const modal = getSummaryModal();
    const title = modal.querySelector("#marketAnnualSummaryTitle");
    const subtitle = modal.querySelector(".market-summary-subtitle");
    const headerCells = modal.querySelectorAll("thead th");
    const tbody = modal.querySelector("tbody");

    const period = year === "latest"
      ? (t("statusLatest") || "Latest available")
      : year;

    title.textContent = t("summaryTitle") || "Market indicators";
    subtitle.textContent =
      `${period} · ${rows.length} ${t("summaryCompanies") || "companies"}`;

    headerCells[0].textContent = t("summaryIndicator") || "Indicator";
    headerCells[1].textContent = t("summaryMarket") || "Market";

    const labels = [
      [t("summaryTurnover") || "Turnover, €", euro(totalTurnover), ""],
      [t("summaryEquity") || "Equity, €", euro(totalEquity), ""],
      [
        t("summaryProfit") || "Profit, €",
        euro(totalProfit),
        totalProfit > 0
          ? "market-summary-positive"
          : totalProfit < 0
            ? "market-summary-negative"
            : ""
      ],
      [
        t("summaryProfitability") || "Profitability",
        percent(margin),
        margin > 0
          ? "market-summary-positive"
          : margin < 0
            ? "market-summary-negative"
            : ""
      ],
      [t("summaryEmployees") || "Employees", number(totalEmployees), ""],
      [t("summaryTurnoverPerEmployee") || "Turnover / employee, €", euro(turnoverPerEmployee), ""],
      [t("summaryProfitPerEmployee") || "Profit / employee, €", euro(profitPerEmployee), ""]
    ];

    tbody.innerHTML = labels.map(([label, value, className]) =>
      `<tr><td>${escapeHtml(label)}</td><td class="${className || ""}">${escapeHtml(value)}</td></tr>`
    ).join("");

    setupCsvExport(modal, availableYears, (rangeYear, csvRows) => {
      const previousYear = yearSelect.value;
      yearSelect.value = String(rangeYear);
      showAnnualSummary();

      const reportModal = document.getElementById("marketAnnualSummaryModal");
      const reportRows = [...reportModal.querySelectorAll(".market-summary-table tbody tr")];
      const labels = reportRows.map(tr => tr.querySelectorAll("td")[0]?.textContent.trim() || "");
      const values = reportRows.map(tr => tr.querySelectorAll("td")[1]?.textContent.trim() || "");

      if (csvRows.length === 0) {
        csvRows.push([t("csvYear") || "Year", ...labels]);
      }
      csvRows.push([String(rangeYear), ...values]);

      yearSelect.value = previousYear;
      showAnnualSummary();
    }, () => {
      const period = modal.querySelector(".market-summary-subtitle").textContent.split("·")[0].trim();
      return { filename: period.toLowerCase().replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, ""),
        rows: currentSummaryCsvRows(modal, period) };
    });

    modal.hidden = false;
  }

  function sortValue(company, record) {
    switch (sortSelect.value) {
      case "turnover": return record?.turnover;
      case "equity": return record?.equity;
      case "profit": return record?.profit;
      case "margin": return record?.margin;
      case "employees": return record?.employees;
      case "turnoverPerEmployee": return record?.turnoverPerEmployee;
      case "name": return company.name || "";
      default: return record?.turnover;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render() {
    const year = yearSelect.value;
    const query = searchInput.value.trim().toLowerCase();
    const mobileLabels = getMobileLabels();

    const rows = companies
      .map(company => ({ company, record: getRecord(company, year) }))
      .filter(item => String(item.company.name || "").toLowerCase().includes(query));

    rows.sort((a, b) => {
      const av = sortValue(a.company, a.record);
      const bv = sortValue(b.company, b.record);

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (sortSelect.value === "name") {
        const result = String(av).localeCompare(String(bv), document.documentElement.lang || "en");
        return sortDirection.value === "asc" ? result : -result;
      }

      return sortDirection.value === "asc"
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });

    const total = rows.length;

    body.innerHTML = rows.map(({ company, record }, index) => {
      const registryCode = company.registryCode || company.registry_code || "";

      const lang = ["en", "et", "ru"].includes(document.documentElement.lang)
        ? document.documentElement.lang
        : "en";

      const teatmikUrl = registryCode
        ? `https://www.teatmik.ee/${lang}/personlegal/${encodeURIComponent(registryCode)}`
        : "";

      const companyName = company.website
        ? `<a href="${escapeHtml(company.website)}" target="_blank" rel="noopener noreferrer" class="company-name">${escapeHtml(company.name)}</a>`
        : `<span class="company-name">${escapeHtml(company.name)}</span>`;

      const teatmik = teatmikUrl
        ? `<a href="${teatmikUrl}" target="_blank" rel="noopener noreferrer" class="teatmik-link" title="TEATMIK" aria-label="TEATMIK"><span class="teatmik-icon">t</span></a>`
        : "";

      const profitClass = record?.profit == null
        ? "muted"
        : Number(record.profit) > 0 ? "positive" : Number(record.profit) < 0 ? "negative" : "";

      const marginClass = record?.margin == null
        ? "muted"
        : Number(record.margin) > 0 ? "positive" : Number(record.margin) < 0 ? "negative" : "";

      const label = index => escapeHtml(mobileLabels[index] || "");

      return `<tr>
        <td class="company">
        <span class="company-cell">
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
        <td data-label="${label(1)}">${record?.year ?? "—"}</td>
        <td data-label="${label(2)}">${euro(record?.turnover)}</td>
        <td data-label="${label(3)}">${euro(record?.equity)}</td>
        <td class="${profitClass}" data-label="${label(4)}">${euro(record?.profit)}</td>
        <td class="${marginClass}" data-label="${label(5)}">${percent(record?.margin)}</td>
        <td data-label="${label(6)}">${number(record?.employees)}</td>
        <td data-label="${label(7)}">${euro(record?.turnoverPerEmployee)}</td>
      </tr>`;
    }).join("");

    const rowsWithData = rows.filter(({ record }) => record != null).length;
    const periodLabel = year === "latest" ? (t("statusLatest") || "Latest available") : year;

    status.textContent =
      `${t("statusCompanies") || "Companies"}: ${rows.length} · ` +
      `${t("statusWithData") || "With data"}: ${rowsWithData} · ` +
      `${t("statusPeriod") || "Period"}: ${periodLabel}`;

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

      const updatedElement = document.getElementById("marketMonitorAnnualUpdated");
      if (updatedElement && data.updated) {
        const updated = String(data.updated).split(".")[0];
        updatedElement.textContent =
          `${updatedElement.dataset.prefix || "Updated"}: ${updated.replace("T", ", ")} UTC`;
      }

      fillYears();
      render();
    } catch (error) {
      console.error("Market Monitor:", error);
      status.textContent = t("loadError") || "Failed to load Market Monitor data.";
      body.innerHTML = `
  <tr>
    <td colspan="8" class="quarterly-error">
      ${escapeHtml(t("checkFile") || "Please check the file")}
      <strong>MarketMonitor/companies.json</strong>
      ${escapeHtml(
        t("localHttp") ||
        "and make sure the page is running through a local HTTP server."
      )}
    </td>
  </tr>
`;
    }
  }

  yearSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  sortDirection.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  if (summaryButton) {
    summaryButton.addEventListener("click", showAnnualSummary);
  }

  setupSelection();
  loadData();
})();
