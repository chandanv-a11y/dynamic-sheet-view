const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUKuo3yzsWt5nrvL0h6fnnX8DjwTyzc9VzTi9VmdanF-DZChVDVrJrtJ55THxWzp78KJcMdURoLGe9/pub?output=csv";

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n").map(r => r.split(","));
    const table = document.getElementById("table");

    // headers
    const thead = document.createElement("tr");
    rows[0].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      thead.appendChild(th);
    });
    table.appendChild(thead);

    // data
    rows.slice(1).forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  });
