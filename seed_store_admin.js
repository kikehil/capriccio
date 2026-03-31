const db = require('./db');
const bcrypt = require('bcryptjs');

async function sed() {
    try {
        const pass = await bcrypt.hash('pizza2026', 10);
        // Crear un administrador para el negocio 1 (Capriccio)
        await db.query(`
            INSERT INTO usuarios (username, password, role, nombre_completo, negocio_id, activo)
            VALUES ('capriccio_admin', ?, 'admin', 'Gerente Capriccio', 1, 1)
            ON CONFLICT(username) DO UPDATE SET password = excluded.password;
        `, [pass]);
        
        console.log('✅ Usuario Administrador de Negocio creado:');
        console.log('Usuario: capriccio_admin');
        console.log('Password: pizza2026');
        console.log('Este usuario verá Dashboard, Productos, etc. pero NO Plataforma.');
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}

sed();
