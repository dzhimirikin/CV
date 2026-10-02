(() => {
  "use strict";

  const DATA_URL = window.location.pathname.includes("/MarketMonitor/")
  ? "companies_quarterly.json"
  : "MarketMonitor/companies_quarterly.json";

  const yearSelect = document.getElementById("quarterlyYear");
  const quarterSelect = document.getElementById("quarterlyQuarter");
  const sortSelect = document.getElementById("quarterlySort");
  const directionSelect = document.getElementById("quarterlyDirection");
  const searchInput = document.getElementById("quarterlySearch");
  const body = document.getElementById("quarterlyBody");
  const status = document.getElementById("quarterlyStatus");

  if (
    !yearSelect ||
    !quarterSelect ||
    !sortSelect ||
    !directionSelect ||
    !searchInput ||
    !body ||
    !status
  ) {
    return;
  }

  let companies = [];

  // ------------------------------------------------------------
  // FORMAT
  // ------------------------------------------------------------

  const euro = value =>
    value == null
      ? "—"
      : new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: 0
        }).format(Number(value));

  const number = value =>
    value == null
      ? "—"
      : new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: 0
        }).format(Number(value));

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getRecord(company, year, quarter) {
    const history = Array.isArray(company.history) ? company.history : [];

    return (
      history.find(
        record =>
          Number(record.year) === Number(year) &&
          Number(record.quarter) === Number(quarter)
      ) || null
    );
  }

  function availableYears() {
    const years = new Set();

    companies.forEach(company => {
      (company.history || []).forEach(record => {
        if (record.year != null) {
          years.add(Number(record.year));
        }
      });
    });

    return [...years].sort((a, b) => b - a);
  }

  function availableQuarters(year) {
    const quarters = new Set();

    companies.forEach(company => {
      (company.history || []).forEach(record => {
        if (
          Number(record.year) === Number(year) &&
          record.quarter != null
        ) {
          quarters.add(Number(record.quarter));
        }
      });
    });

    return [...quarters].sort((a, b) => b - a);
  }

  // ------------------------------------------------------------
  // SELECTS
  // ------------------------------------------------------------

  function fillYears() {
    yearSelect.innerHTML = "";

    availableYears().forEach(year => {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    });

    if (yearSelect.options.length > 0) {
      yearSelect.value = String(Math.max(...availableYears()));
    }

    fillQuarters();
  }

  function fillQuarters() {
    const previousQuarter = quarterSelect.value;
    const year = Number(yearSelect.value);
    const quarters = availableQuarters(year);

    quarterSelect.innerHTML = "";

    quarters.forEach(quarter => {
      const option = document.createElement("option");
      option.value = String(quarter);
      option.textContent = `Q${quarter}`;
      quarterSelect.appendChild(option);
    });

    if (
      previousQuarter &&
      quarters.includes(Number(previousQuarter))
    ) {
      quarterSelect.value = previousQuarter;
    } else if (quarters.length > 0) {
      quarterSelect.value = String(quarters[0]);
    }
  }

  // ------------------------------------------------------------
  // SORT
  // ------------------------------------------------------------

  function sortValue(company, record) {
    switch (sortSelect.value) {
      case "taxableTurnover":
        return record?.taxableTurnover;
      case "stateTaxes":
        return record?.stateTaxes;
      case "labourTaxes":
        return record?.labourTaxes;
      case "employees":
        return record?.employees;
      case "taxableTurnoverPerEmployee":
        return record?.taxableTurnoverPerEmployee;
      case "name":
        return company.name || "";
      default:
        return record?.taxableTurnover;
    }
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  function render() {
    const year = Number(yearSelect.value);
    const quarter = Number(quarterSelect.value);
    const search = searchInput.value.trim().toLowerCase();

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
        const result = String(av).localeCompare(String(bv), "ru");
        return directionSelect.value === "asc"
          ? result
          : -result;
      }

      const result = Number(av) - Number(bv);
      return directionSelect.value === "asc"
        ? result
        : -result;
    });

    body.innerHTML = rows
      .map(({ company, record }) => {
        const registryCode =
          company.registryCode ||
          company.registry_code ||
          "";

        const teatmikUrl = registryCode
          ? `https://www.teatmik.ee/et/personlegal/${encodeURIComponent(
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

        const turnoverClass =
          record?.taxableTurnover == null
            ? "quarterly-muted"
            : Number(record.taxableTurnover) > 0
              ? "quarterly-positive"
              : Number(record.taxableTurnover) < 0
                ? "quarterly-negative"
                : "";

        return `
          <tr>
            <td>
              <span class="quarterly-company-cell">
                ${companyName}
                ${teatmik}
              </span>
            </td>
            <td>${record?.period ?? "—"}</td>
            <td class="${turnoverClass}">
              ${euro(record?.taxableTurnover)}
            </td>
            <td>${euro(record?.stateTaxes)}</td>
            <td>${euro(record?.labourTaxes)}</td>
            <td>${number(record?.employees)}</td>
            <td>${euro(record?.taxableTurnoverPerEmployee)}</td>
          </tr>
        `;
      })
      .join("");

    const availableCount = rows.filter(item => item.record != null).length;

    status.textContent =
      `Компаний: ${rows.length} · ` +
      `С данными: ${availableCount} · ` +
      `Период: ${year}-Q${quarter}`;
  }

  // ------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------

  async function loadData() {
    try {
      const response = await fetch(DATA_URL, {
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      companies = Array.isArray(data.companies)
        ? data.companies
        : [];

      fillYears();
      render();
    } catch (error) {
      console.error("Quarterly Market Monitor:", error);

      status.textContent =
        `Ошибка загрузки квартальных данных: ${error.message}`;

      body.innerHTML = `
        <tr>
          <td colspan="7" class="quarterly-error">
            Файл: <strong>${DATA_URL}</strong><br>
            Проверьте путь к <strong>companies_quarterly.json</strong>
            и запуск через локальный HTTP-сервер.
          </td>
        </tr>
      `;
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
