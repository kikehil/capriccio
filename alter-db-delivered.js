const db = require('./db');

async function run() {
    try {
        console.log('Adding delivered_at column to pedidos table...');
        await db.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP');
        console.log('Migration OK');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

run();
