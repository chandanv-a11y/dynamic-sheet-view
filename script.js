
const SHEET_GID = new URLSearchParams(window.location.search).get("gid");

const SPREADSHEET_ID = "1DQb28aLuAK1uSgZnMR2GdW2Cq2QHRfP08A0QVX-VV6U"; 

const PERFORMANCE_GID = "275411016";
const STATUS_GID = SHEET_GID;

// Default performance year
const DEFAULT_YEAR = "2025";

// URLs
const PERFORMANCE_URL =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${PERFORMANCE_GID}`;

const STATUS_URL =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${STATUS_GID}`;

// ---------- CSV PARSER ----------
function parseCSV(csv) {
  return csv
    .trim()
    .split("\n")
    .map(r =>
      r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(c => c.replace(/(^"|"$)/g, "").trim())
    );
}

// ---------- FETCH BOTH ----------
Promise.all([
  fetch(PERFORMANCE_URL).then(r => r.text()),
  fetch(STATUS_URL).then(r => r.text())
]).then(([perfCSV, statusCSV]) => {
  initPerformance(perfCSV);
  renderFullTable(statusCSV, "statusTable");
}).catch(err => console.error("Fetch error:", err));

// ---------- PERFORMANCE LOGIC ----------
function initPerformance(csv) {
  const rows = parseCSV(csv);
  const headers = rows[0];
  const data = rows.slice(1);

  const yearSelect = document.getElementById("yearSelect");
  yearSelect.innerHTML = "";

  const years = [...new Set(
    headers
      .filter(h => /^\d{4}/.test(h))
      .map(h => h.split(" ")[0])
  )];

  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === DEFAULT_YEAR) opt.selected = true;
    yearSelect.appendChild(opt);
  });

  yearSelect.addEventListener("change", () =>
    renderPerformanceTable(headers, data, yearSelect.value)
  );

  renderPerformanceTable(headers, data, DEFAULT_YEAR);
}

function renderPerformanceTable(headers, data, year) {
  const table = document.getElementById("performanceTable");
  table.innerHTML = "";

  const plannedCol = headers.indexOf(year);
  const realisedCol = headers.findIndex(h =>
    h.startsWith(year) && h.toLowerCase().includes("real")
  );

  // Header
  const head = document.createElement("tr");
  ["STRATEGIC PILLARS", "AXIS", "KPI", "Planned", "Realised"].forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    head.appendChild(th);
  });
  table.appendChild(head);

  // Rows
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[plannedCol] || "-"}</td>
      <td>${r[realisedCol] || "-"}</td>
    `;
    table.appendChild(tr);
  });
}

// ---------- SUCCESS & PRIORITY ----------
function renderFullTable(csv, tableId) {
  const rows = parseCSV(csv);
  const table = document.getElementById(tableId);
  table.innerHTML = "";

  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const el = document.createElement(i === 0 ? "th" : "td");
      el.textContent = cell;
      tr.appendChild(el);
    });
    table.appendChild(tr);
  });
}
