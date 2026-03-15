const db = require('./db');

async function test() {
    const now = new Date();
    const todayCA = now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    
    console.log('--- TIME INFO ---');
    console.log('Now UTC:', now.toISOString());
    console.log('Pánuco Date (Target):', todayCA);

    try {
        console.log('\n--- DATA VERIFICATION ---');
        const revQuery = "SELECT total, created_at, date(created_at, '-6 hours') as day_local FROM pedidos ORDER BY created_at DESC LIMIT 5";
        const res = await db.query(revQuery);
        console.table(res.rows);

        const sumQuery = "SELECT SUM(total) as revenue FROM pedidos WHERE date(created_at, '-6 hours') = $1 AND status != 'cancelado'";
        const sumRes = await db.query(sumQuery, [todayCA]);
        console.log(`\nQUERY: ${sumQuery} with param [${todayCA}]`);
        console.log('RESULT:', sumRes.rows[0]);

    } catch (e) {
        console.error(e);
    }
}

test();
