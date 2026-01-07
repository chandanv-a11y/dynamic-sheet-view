// 🔴 REPLACE WITH YOUR REAL VALUES
const SUPPLIER_GID = "678738705";
const ITEM_GID = "1062614252";

const SUPPLIER_URL =
`https://docs.google.com/spreadsheets/d/e/2PACX-1vRUKuo3yzsWt5nrvL0h6fnnX8DjwTyzc9VzTi9VmdanF-DZChVDVrJrtJ55THxWzp78KJcMdURoLGe9/pub?output=csv&gid=${SUPPLIER_GID}`
const ITEM_URL =
`https://docs.google.com/spreadsheets/d/e/2PACX-1vRUKuo3yzsWt5nrvL0h6fnnX8DjwTyzc9VzTi9VmdanF-DZChVDVrJrtJ55THxWzp78KJcMdURoLGe9/pub?output=csv&gid=${ITEM_GID}`
  
let supplierMaster = [];
let itemData = [];

// ---------- CSV PARSER ----------
function parseCSV(csv) {
  const rows = csv.trim().split("\n");
  const headers = rows.shift().split(",");

  return rows.map(row => {
    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.replace(/(^"|"$)/g, "").trim();
    });
    return obj;
  });
}

// ---------- FETCH DATA ----------
Promise.all([
  fetch(SUPPLIER_URL).then(res => res.text()),
  fetch(ITEM_URL).then(res => res.text())
]).then(([supplierCSV, itemCSV]) => {
  supplierMaster = parseCSV(supplierCSV);
  itemData = parseCSV(itemCSV);
  populateSupplierDropdown();
});

// ---------- POPULATE DROPDOWN ----------
function populateSupplierDropdown() {
  const select = document.getElementById("supplierSelect");

  supplierMaster.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.SUPPLIER;
    opt.textContent = s.SUPPLIER;
    select.appendChild(opt);
  });
}

// ---------- ON SUPPLIER CHANGE ----------
document.getElementById("supplierSelect").addEventListener("change", function () {
  const supplier = this.value;

  if (!supplier) return;

  renderSupplierDetails(supplier);
  renderSupplierItems(supplier);
});

// ---------- SUPPLIER DETAILS ----------
function renderSupplierDetails(name) {
  const s = supplierMaster.find(x => x.SUPPLIER === name);

  document.getElementById("supplierDetails").style.display = "block";

  document.getElementById("detailsContent").innerHTML = `
    <strong>Supplier:</strong> ${s.SUPPLIER}<br>
    <strong>POC:</strong> ${s["SUPPLIER POC"]}<br>
    <strong>Contact:</strong> ${s["SUPPLIER CONTACT"]}<br>
    <strong>Location:</strong> ${s.LOCATION}
  `;
}

// ---------- ITEMS TABLE ----------
function renderSupplierItems(name) {
  const tbody = document.querySelector("#itemsTable tbody");
  tbody.innerHTML = "";

  const filtered = itemData.filter(i => i.SUPPLIER === name);

  filtered.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.ITEM}</td>
      <td>${i.PLQ}</td>
      <td>${i.PLS}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("itemsCard").style.display = "block";
}
