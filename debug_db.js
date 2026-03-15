const db = require('./db');

async function check() {
    try {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
        console.log('Target Local Date:', today);

        const res = await db.query("SELECT id, total, negocio_id, created_at, date(created_at, '-6 hours') as day_local FROM pedidos ORDER BY created_at DESC LIMIT 10");
        console.table(res.rows);

    } catch (e) {
        console.error(e);
    }
    process.exit();
}

check();
