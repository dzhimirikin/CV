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

    body.innerHTML = rows.map(({ company, record }) => {
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
          <span class="company-cell">${companyName}${teatmik}</span>
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
  }

  async function loadData() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      companies = Array.isArray(data.companies) ? data.companies : [];
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

  loadData();
})();
