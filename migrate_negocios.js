const db = require('./db');

async function migrate() {
    try {
        // 1. Tabla de negocios (pizzerías en la plataforma)
        await db.query(`
            CREATE TABLE IF NOT EXISTS negocios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                propietario TEXT,
                email TEXT UNIQUE,
                telefono TEXT,
                ciudad TEXT,
                plan TEXT DEFAULT 'basico',
                activo INTEGER DEFAULT 1,
                fecha_alta DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_vencimiento DATETIME,
                notas TEXT
            )
        `);
        console.log("✅ Tabla 'negocios' lista.");

        // 2. Insertar negocio de ejemplo (Capriccio)
        try {
            await db.query(`
                INSERT INTO negocios (nombre, propietario, email, telefono, ciudad, plan, notas)
                VALUES ('Pizza Capriccio', 'Propietario Demo', 'capriccio@demo.com', '834-000-0000', 'Tampico, TAM', 'premium', 'Negocio demo de la plataforma')
            `);
            console.log("✅ Negocio de demo insertado.");
        } catch(e) {
            console.log("ℹ️  El negocio demo ya existe.");
        }

        console.log("🎉 Migración completada.");
        process.exit(0);
    } catch(err) {
        console.error("❌ Error en migración:", err);
        process.exit(1);
    }
}

migrate();
