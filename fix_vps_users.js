const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Conectar a la base de datos del VPS
const db = new sqlite3.Database('/var/www/html/capriccio/capriccio/database.sqlite');

const adminHashed = bcrypt.hashSync('CapriccioAdmin2026!', 10);
const capriccioHashed = bcrypt.hashSync('Capriccio2026!', 10);

db.serialize(() => {
    // 1. Eliminar al usuario capriccio por si estuviera mal creado y volver a insertarlo
    db.run("DELETE FROM usuarios WHERE username = 'capriccio'", (err) => {
        if (!err) console.log("Limpiando usuario 'capriccio' existente...");
    });
    
    // Insertar capriccio con Rol ADMIN y negocio_id = 1
    db.run("INSERT INTO usuarios (username, password, role, activo, negocio_id, nombre_completo) VALUES ('capriccio', ?, 'admin', 1, 1, 'Capriccio Master')", [capriccioHashed], (err) => {
        if (err) console.error('❌ Error insertando capriccio:', err.message);
        else console.log('✅ Usuario capriccio (admin) creado/asignado exitosamente con clave: Capriccio2026!');
    });

    // 2. Administrador general (actualizar rol a admin, negocio nulo para todos, o id=1)
    db.run("UPDATE usuarios SET password = ?, role = 'admin', activo = 1 WHERE username = 'admin'", [adminHashed], (err) => {
        if (err) console.error('❌ Error actualizando admin:', err.message);
        else console.log('✅ Usuario admin actualizado exitosamente con clave: CapriccioAdmin2026!');
    });
});

db.close(() => {
    console.log("Cerrando sesión de SQLite.");
});
