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

  if (!yearSelect || !sortSelect || !sortDirection || !searchInput || !body || !status) return;

  let companies = [];

  const SELECTION_KEY = "marketMonitorExcludedCompanies";

  function companyKey(company) {
    return String(
      company.registryCode ||
      company.registry_code ||
      company.name ||
      ""
    ).trim().toLowerCase();
  }

  function getExcludedCompanies() {
    try {
      const raw = sessionStorage.getItem(SELECTION_KEY);
      const values = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(values) ? values.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function saveExcludedCompanies(excluded) {
    try {
      sessionStorage.setItem(SELECTION_KEY, JSON.stringify([...excluded]));
    } catch {
      // Ignore storage errors.
    }
  }

  function isCompanySelected(company) {
    return !getExcludedCompanies().has(companyKey(company));
  }

  function setCompanySelected(company, selected) {
    const excluded = getExcludedCompanies();
    const key = companyKey(company);
    if (!key) return;
    if (selected) excluded.delete(key);
    else excluded.add(key);
    saveExcludedCompanies(excluded);
    window.dispatchEvent(new CustomEvent("marketMonitorSelectionChanged"));
  }

  function setAllCompaniesSelected(selected) {
    const excluded = getExcludedCompanies();
    companies.forEach(company => {
      const key = companyKey(company);
      if (!key) return;
      if (selected) excluded.delete(key);
      else excluded.add(key);
    });
    saveExcludedCompanies(excluded);
    window.dispatchEvent(new CustomEvent("marketMonitorSelectionChanged"));
  }

  function allCompaniesSelected() {
    return companies.length > 0 && companies.every(company => isCompanySelected(company));
  }

  function ensureSelectionControl() {
    let control = document.getElementById("marketAnnualSelectionControl");
    if (control) return control;

    const tableWrap = document.querySelector("#marketMonitorAnnual .table-wrap");
    if (!tableWrap) return null;

    control = document.createElement("div");
    control.id = "marketAnnualSelectionControl";
    control.className = "market-selection-action";
    control.innerHTML = `
      <label class="market-selection-label">
        <input id="marketAnnualSelectAll" type="checkbox">
        <span></span>
      </label>`;
    tableWrap.parentNode.insertBefore(control, tableWrap);

    const checkbox = control.querySelector("input");
    checkbox.addEventListener("change", () => {
      setAllCompaniesSelected(checkbox.checked);
    });

    return control;
  }

  function updateSelectionControl() {
    const control = ensureSelectionControl();
    if (!control) return;
    const checkbox = control.querySelector("input");
    const label = control.querySelector("span");
    const selected = allCompaniesSelected();
    checkbox.checked = selected;
    checkbox.indeterminate = false;
    checkbox.setAttribute(
      "aria-label",
      t(selected ? "summaryDeselectAll" : "summarySelectAll") ||
        (selected ? "Deselect all" : "Select all")
    );
    label.textContent = t(selected ? "summaryDeselectAll" : "summarySelectAll") ||
      (selected ? "Deselect all" : "Select all");
  }

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
        String(item.company.name || "").toLowerCase().includes(query) &&
        item.record != null &&
        isCompanySelected(item.company)
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
                class="market-company-checkbox"
                type="checkbox"
                data-company-key="${escapeHtml(companyKey(company))}"
                ${isCompanySelected(company) ? "checked" : ""}
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

    body.querySelectorAll(".market-company-checkbox").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const company = companies.find(item => companyKey(item) === checkbox.dataset.companyKey);
        if (company) setCompanySelected(company, checkbox.checked);
      });
    });

    updateSelectionControl();

    const rowsWithData = rows.filter(({ record }) => record != null).length;
    const periodLabel = year === "latest" ? (t("statusLatest") || "Latest available") : year;

    status.textContent =
      `${t("statusCompanies") || "Companies"}: ${rows.length} · ` +
      `${t("statusWithData") || "With data"}: ${rowsWithData} · ` +
      `${t("statusPeriod") || "Period"}: ${periodLabel}`;
  }

  async function loadData() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      companies = Array.isArray(data.companies) ? data.companies : [];

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

  window.addEventListener("marketMonitorSelectionChanged", render);

  loadData();
})();
