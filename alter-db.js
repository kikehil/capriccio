const db = require('./db');

async function run() {
    try {
        console.log('Adding repartidor column to pedidos table...');
        await db.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS repartidor VARCHAR(255)');
        console.log('Migration OK');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

run();
