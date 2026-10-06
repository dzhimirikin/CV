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

  const SELECTION_STORAGE_KEY = "marketMonitorExcludedCompanies";

  function companyKey(company) {
    return String(
      company?.registryCode ||
      company?.registry_code ||
      company?.name ||
      ""
    ).trim();
  }

  function loadExcludedCompanies() {
    try {
      const raw = sessionStorage.getItem(SELECTION_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch (error) {
      return new Set();
    }
  }

  let excludedCompanies = loadExcludedCompanies();

  function saveExcludedCompanies() {
    try {
      sessionStorage.setItem(
        SELECTION_STORAGE_KEY,
        JSON.stringify([...excludedCompanies])
      );
    } catch (error) {
      // Selection still works for the current page if storage is unavailable.
    }
  }

  function isCompanySelected(company) {
    const key = companyKey(company);
    return key ? !excludedCompanies.has(key) : true;
  }

  function selectionLabels() {
    const lang = document.documentElement.lang || "en";
    if (lang === "ru") {
      return { selectAll: "Выделить все", deselectAll: "Снять выделение со всех" };
    }
    if (lang === "et") {
      return { selectAll: "Vali kõik", deselectAll: "Tühista kõik valikud" };
    }
    return { selectAll: "Select all", deselectAll: "Deselect all" };
  }

  function updateMasterCheckboxes() {
    const checkboxes = document.querySelectorAll(".market-summary-select-all");
    if (!checkboxes.length) return;

    const keyedCompanies = companies.filter(company => companyKey(company));
    const allSelected = keyedCompanies.length === 0 ||
      keyedCompanies.every(isCompanySelected);
    const labels = selectionLabels();

    checkboxes.forEach(checkbox => {
      checkbox.checked = allSelected;
      checkbox.indeterminate = false;
      checkbox.setAttribute("aria-label", allSelected ? labels.deselectAll : labels.selectAll);
      const text = checkbox.closest("label")?.querySelector(".market-summary-select-label");
      if (text) text.textContent = allSelected ? labels.deselectAll : labels.selectAll;
    });
  }

  function createSelectionControl(container) {
    if (container.querySelector(".market-selection-action")) {
      updateMasterCheckboxes();
      return;
    }

    const labels = selectionLabels();
    const action = document.createElement("div");
    action.className = "market-selection-action";
    action.innerHTML = `
      <label class="market-summary-select-all-label">
        <input type="checkbox" class="market-summary-select-all" checked>
        <span class="market-summary-select-label">${escapeHtml(labels.deselectAll)}</span>
      </label>
    `;

    const checkbox = action.querySelector(".market-summary-select-all");
    checkbox.addEventListener("change", () => {
      const shouldSelect = checkbox.checked;
      companies.forEach(company => {
        const key = companyKey(company);
        if (!key) return;
        if (shouldSelect) {
          excludedCompanies.delete(key);
        } else {
          excludedCompanies.add(key);
        }
      });
      saveExcludedCompanies();
      render();
      updateMasterCheckboxes();
    });

    const tableWrap =
      container.querySelector(".table-wrap") ||
      container.querySelector(".quarterly-table-wrap");

    if (tableWrap) {
      container.insertBefore(action, tableWrap);
    } else {
      container.appendChild(action);
    }

    updateMasterCheckboxes();
  }

  function handleCompanySelection(company, selected) {
    const key = companyKey(company);
    if (!key) return;

    if (selected) {
      excludedCompanies.delete(key);
    } else {
      excludedCompanies.add(key);
    }

    saveExcludedCompanies();
    updateMasterCheckboxes();
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
        isCompanySelected(item.company) &&
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
            <input
              type="checkbox"
              class="market-company-select"
              data-company-key="${escapeHtml(companyKey(company))}"
              ${isCompanySelected(company) ? "checked" : ""}
              aria-label="${escapeHtml(company.name || "Company")}"
            >
            <span class="company-rank">${index + 1}/${total}</span>
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

    body.querySelectorAll(".market-company-select").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const key = checkbox.dataset.companyKey || "";
        const company = companies.find(item => companyKey(item) === key);
        if (!company) return;
        handleCompanySelection(company, checkbox.checked);
      });
    });

    updateMasterCheckboxes();

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
      const annualPanel = document.getElementById("marketMonitorAnnual");
      const annualTableWrap = annualPanel?.querySelector(".table-wrap");
      if (annualTableWrap) createSelectionControl(annualPanel);
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

  loadData();
})();
