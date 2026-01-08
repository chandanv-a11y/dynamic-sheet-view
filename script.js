const SHEET_GID = new URLSearchParams(window.location.search).get("gid");

const SPREADSHEET_ID = "1DQb28aLuAK1uSgZnMR2GdW2Cq2QHRfP08A0QVX-VV6U"; 

const PERFORMANCE_GID = "275411016";
const STATUS_GID = SHEET_GID;

const DEFAULT_YEAR = "2025";

// URLs
const PERFORMANCE_URL =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${PERFORMANCE_GID}`;

const STATUS_URL =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${STATUS_GID}`;

// ---------- HELPERS ----------
function parseCSV(csv) {
  return csv
    .trim()
    .split("\n")
    .map(r =>
      r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(c => c.replace(/(^"|"$)/g, "").trim())
    );
}

function normalize(h) {
  return h
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "")
    .toLowerCase()
    .trim();
}

// ---------- FETCH ----------
Promise.all([
  fetch(PERFORMANCE_URL).then(r => r.text()),
  fetch(STATUS_URL).then(r => r.text())
]).then(([perfCSV, statusCSV]) => {
  initPerformance(perfCSV);
  renderFullTable(statusCSV, "statusTable");
}).catch(err => console.error("Fetch error:", err));


// ================= PERFORMANCE =================

function initPerformance(csv) {
  const rows = parseCSV(csv);
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalize);
  const data = rows.slice(1);

  const yearSelect = document.getElementById("yearSelect");
  yearSelect.innerHTML = "";

  // 🔑 Detect year columns by PURE year value
  const yearIndexes = [];

  headers.forEach((h, i) => {
    if (/^\d{4}$/.test(h)) {
      yearIndexes.push({ year: h, index: i });
    }
  });

  // Populate dropdown
  yearIndexes.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y.year;
    opt.textContent = y.year;
    if (y.year === DEFAULT_YEAR) opt.selected = true;
    yearSelect.appendChild(opt);
  });

  yearSelect.addEventListener("change", () =>
    renderPerformanceTable(data, yearIndexes, yearSelect.value)
  );

  renderPerformanceTable(data, yearIndexes, DEFAULT_YEAR);
}

function renderPerformanceTable(data, yearIndexes, year) {
  const table = document.getElementById("performanceTable");
  table.innerHTML = "";

  const yearObj = yearIndexes.find(y => y.year === year);
  if (!yearObj) return;

  const plannedIndex = yearObj.index;
  const realisedIndex = plannedIndex + 1; // 🔑 CRITICAL FIX

  // Header
  const head = document.createElement("tr");
  ["STRATEGIC PILLARS", "AXIS", "KPI", `${year} Planned`, `${year} Realised`]
    .forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      head.appendChild(th);
    });
  table.appendChild(head);

  // Rows
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r[0] || ""}</td>
      <td>${r[1] || ""}</td>
      <td>${r[2] || ""}</td>
      <td>${r[plannedIndex] || "-"}</td>
      <td>${r[realisedIndex] || "-"}</td>
    `;
    table.appendChild(tr);
  });
}

// ================= SUCCESS / PRIORITY =================

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
