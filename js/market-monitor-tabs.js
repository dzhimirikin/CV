(() => {
  "use strict";

  const annualTab = document.getElementById("marketMonitorAnnualTab");
  const quarterlyTab = document.getElementById("marketMonitorQuarterlyTab");

  const annualPanel = document.getElementById("marketMonitorAnnual");
  const quarterlyPanel = document.getElementById("marketMonitorQuarterly");

  if (!annualTab || !quarterlyTab || !annualPanel || !quarterlyPanel) {
    return;
  }

  function showReport(report) {
    const annual = report === "annual";

    annualTab.classList.toggle("active", annual);
    quarterlyTab.classList.toggle("active", !annual);

    annualTab.setAttribute("aria-selected", annual ? "true" : "false");
    quarterlyTab.setAttribute("aria-selected", annual ? "false" : "true");

    annualPanel.hidden = !annual;
    quarterlyPanel.hidden = annual;
  }

  annualTab.addEventListener("click", () => {
    showReport("annual");
  });

  quarterlyTab.addEventListener("click", () => {
    showReport("quarterly");
  });

  // Annual report is shown by default.
  showReport("annual");
})();
