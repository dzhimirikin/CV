const DATA_URL = "MarketMonitor/companies.json";

const yearSelect = document.getElementById("year");
const sortSelect = document.getElementById("sort");
const sortDirection = document.getElementById("sortDirection");
const searchInput = document.getElementById("search");
const body = document.getElementById("companiesBody");
const status = document.getElementById("status");

let companies = [];

// ------------------------------------------------------------
// FORMAT
// ------------------------------------------------------------

const euro = value =>
  value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0
      }).format(value);

const number = value =>
  value == null
    ? "—"
    : new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 1
      }).format(value);

const percent = value =>
  value == null
    ? "—"
    : `${value.toFixed(1)}%`;

// ------------------------------------------------------------
// RECORD FOR SELECTED YEAR
// ------------------------------------------------------------

function getRecord(company, year) {

  if (year === "latest") {
    return company.latest || null;
  }

  return (
    (company.history || []).find(
      item => String(item.year) === String(year)
    ) || null
  );
}

// ------------------------------------------------------------
// AVAILABLE YEARS
// ------------------------------------------------------------

function availableYears() {

  const years = new Set();

  companies.forEach(company => {
    (company.history || []).forEach(item => {
      years.add(item.year);
    });
  });

  return [...years].sort((a, b) => b - a);
}

// ------------------------------------------------------------
// YEAR SELECT
// ------------------------------------------------------------

function fillYears() {

  yearSelect.innerHTML =
    `<option value="latest">Последний доступный</option>`;

  availableYears().forEach(year => {

    yearSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${year}">${year}</option>`
    );

  });
}

// ------------------------------------------------------------
// SORT VALUE
// ------------------------------------------------------------

function sortValue(company, record) {

  const key = sortSelect.value;

  if (key === "name") {
    return company.name.toLowerCase();
  }

  return record?.[key] ?? null;
}

// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------

function render() {

  const year = yearSelect.value;
  const search = searchInput.value.trim().toLowerCase();

  let rows = companies
    .filter(company =>
      company.name.toLowerCase().includes(search)
    )
    .map(company => ({
      company,
      record: getRecord(company, year)
    }));

  // SORT
  rows.sort((a, b) => {

    const av = sortValue(a.company, a.record);
    const bv = sortValue(b.company, b.record);

    // Empty values always go to the bottom
    if (av == null && bv == null) {
      return 0;
    }

    if (av == null) {
      return 1;
    }

    if (bv == null) {
      return -1;
    }

    // Company name: A-Z / Z-A
    if (sortSelect.value === "name") {

      const result = av.localeCompare(bv, "ru");

      return sortDirection.value === "asc"
        ? result
        : -result;
    }

    // Numeric values
    return sortDirection.value === "asc"
      ? av - bv
      : bv - av;
  });

  body.innerHTML = "";

  // ROWS
  rows.forEach(({ company, record }) => {

    const profitClass =
      record?.profit > 0
        ? "positive"
        : record?.profit < 0
          ? "negative"
          : "";

    const marginClass =
      record?.margin > 0
        ? "positive"
        : record?.margin < 0
          ? "negative"
          : "";

    // ----------------------------------------------------------
    // COMPANY LINKS
    // ----------------------------------------------------------

    const companyUrl = company.website || "#";

    const teatmikUrl =
      `https://www.teatmik.ee/et/personlegal/${company.registryCode}`;

    const companyName = `
      <span class="company-cell">

        <a
          href="${companyUrl}"
          target="_blank"
          rel="noopener"
          class="company-name"
          ${company.website ? "" : 'onclick="return false;"'}
        >
          ${company.name}
        </a>

        <a
          href="${teatmikUrl}"
          target="_blank"
          rel="noopener"
          class="teatmik-link"
          title="TEATMIK"
          aria-label="TEATMIK"
        >
          <span class="teatmik-icon">t</span>
        </a>

      </span>
    `;

    body.insertAdjacentHTML(
      "beforeend",
      `
      <tr>

        <td class="company">
          ${companyName}
        </td>

        <td>
          ${record?.year ?? "—"}
        </td>

        <td>
          ${euro(record?.turnover)}
        </td>

        <td>
          ${euro(record?.equity)}
        </td>

        <td class="${profitClass}">
          ${euro(record?.profit)}
        </td>

        <td class="${marginClass}">
          ${percent(record?.margin)}
        </td>

        <td>
          ${number(record?.employees)}
        </td>

        <td>
          ${euro(record?.turnoverPerEmployee)}
        </td>

      </tr>
      `
    );
  });

  status.textContent =
    `Компаний: ${rows.length} · Данные: companies.json`;
}

// ------------------------------------------------------------
// LOAD JSON
// ------------------------------------------------------------

async function loadData() {

  try {

    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    companies = data.companies || [];

    fillYears();
    render();

  } catch (error) {

    console.error(error);

    status.textContent =
      "Ошибка загрузки companies.json";

  }
}

// ------------------------------------------------------------
// EVENTS
// ------------------------------------------------------------

yearSelect.addEventListener(
  "change",
  render
);

sortSelect.addEventListener(
  "change",
  render
);

sortDirection.addEventListener(
  "change",
  render
);

searchInput.addEventListener(
  "input",
  render
);

// ------------------------------------------------------------
// START
// ------------------------------------------------------------

loadData();