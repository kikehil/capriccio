const db = require('./db');

async function setup() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                nombre_completo TEXT,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL,
                imagen TEXT,
                categoria TEXT,
                activo INTEGER DEFAULT 1,
                precios TEXT
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT UNIQUE NOT NULL,
                cliente_nombre TEXT,
                telefono TEXT,
                direccion TEXT,
                referencias TEXT,
                total REAL,
                lat REAL,
                lng REAL,
                status TEXT DEFAULT 'pendiente',
                repartidor TEXT,
                liquidado INTEGER DEFAULT 0,
                liquidado_por TEXT,
                liquidado_at DATETIME,
                delivered_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS detalle_pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER,
                pizza_nombre TEXT,
                cantidad INTEGER,
                precio_unitario REAL,
                FOREIGN KEY(pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS extras_pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                detalle_id INTEGER,
                extra_nombre TEXT,
                precio_extra REAL,
                FOREIGN KEY(detalle_id) REFERENCES detalle_pedidos(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS promociones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT,
                subtitulo TEXT,
                precio REAL,
                color TEXT,
                imagen TEXT,
                badge TEXT,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const bcrypt = require('bcryptjs');
        const adminPass = await bcrypt.hash('CapriccioAdmin2026!', 10);
        const cocinaPass = await bcrypt.hash('CocinaCap2026!', 10);

        try { await db.query("INSERT INTO usuarios (username, password, role, nombre_completo) VALUES (?, ?, 'admin', 'Administrador')", ['admin', adminPass]); } catch(e){}
        try { await db.query("INSERT INTO usuarios (username, password, role, nombre_completo) VALUES (?, ?, 'cocina', 'Cocina')", ['cocina', cocinaPass]); } catch(e){}

        console.log("✅ Tablas migadas a SQLite exitosamente.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error configurando la base de datos:", error);
        process.exit(1);
    }
}

setup();
