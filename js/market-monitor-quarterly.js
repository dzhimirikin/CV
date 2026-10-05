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
              <span class="company-rank">${index + 1}/${total}</span>
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
  }

  async function loadData() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      companies = Array.isArray(data.companies) ? data.companies : [];

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

  loadData();
})();
