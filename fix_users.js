const db = require('./db');
const bcrypt = require('bcryptjs');

async function fixUsers() {
    try {
        console.log("Hashing passwords...");
        const adminPass = await bcrypt.hash('CapriccioAdmin2026!', 10);
        const capriccioPass = await bcrypt.hash('Capriccio2026!', 10);

        console.log("Updating/Inserting 'admin'...");
        // Intentar actualizar admin
        const resAdmin = await db.query("UPDATE usuarios SET role = 'admin', password = ? WHERE username = 'admin'", [adminPass]);
        if (resAdmin.rowCount === 0) {
            await db.query("INSERT INTO usuarios (username, password, role, nombre_completo) VALUES (?, ?, 'admin', 'Administrador General')", ['admin', adminPass]);
            console.log("Created 'admin' user.");
        } else {
            console.log("Updated 'admin' user.");
        }

        console.log("Updating/Inserting 'capriccio'...");
        // Intentar actualizar capriccio
        const resCap = await db.query("UPDATE usuarios SET role = 'admin', password = ? WHERE username = 'capriccio'", [capriccioPass]);
        if (resCap.rowCount === 0) {
            await db.query("INSERT INTO usuarios (username, password, role, nombre_completo) VALUES (?, ?, 'admin', 'Capriccio Master')", ['capriccio', capriccioPass]);
            console.log("Created 'capriccio' user.");
        } else {
            console.log("Updated 'capriccio' user.");
        }

        const all = await db.query("SELECT id, username, role, activo FROM usuarios");
        console.log("Current users in DB:", all.rows);

        console.log("✅ Users configured successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up users:", err);
        process.exit(1);
    }
}

fixUsers();
