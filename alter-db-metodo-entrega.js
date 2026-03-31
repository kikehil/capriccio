const db = require('./db');

async function run() {
    try {
        console.log('Adding metodo_entrega column to pedidos table...');
        await db.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_entrega TEXT DEFAULT 'domicilio'");
        console.log('Migration OK');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

run();
