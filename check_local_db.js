const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT nombre FROM productos LIMIT 10", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("PRODUCTOS LOCALES:");
    rows.forEach(row => console.log("- " + row.nombre));
    db.close();
});
