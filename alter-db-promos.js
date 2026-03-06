const db = require('./db');

async function run() {
    try {
        console.log('Creating promociones table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS promociones (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                subtitulo VARCHAR(255),
                precio VARCHAR(50),
                color VARCHAR(100),
                imagen TEXT,
                badge VARCHAR(50),
                activo BOOLEAN DEFAULT true
            );
        `);
        console.log('Migration OK');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

run();
