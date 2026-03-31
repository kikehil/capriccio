const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('/var/www/html/capriccio/capriccio/database.sqlite');
const p1 = bcrypt.hashSync('pizza2026', 10);
const p2 = bcrypt.hashSync('CapriccioAdmin2026!', 10);

db.serialize(() => {
    // 1. Asegurar que existe el administrador de negocio
    db.run("DELETE FROM usuarios WHERE username = 'capriccio_admin'");
    db.run("INSERT INTO usuarios (username, password, role, activo, negocio_id, nombre_completo) VALUES ('capriccio_admin', ?, 'admin', 1, 1, 'Admin Capriccio')", [p1], (err) => {
        if (err) console.error('Error insertando capriccio_admin:', err.message);
        else console.log('✅ Usuario capriccio_admin creado/actualizado');
    });

    // 2. Asegurar contraseña del admin maestro
    db.run("UPDATE usuarios SET password = ? WHERE username = 'admin'", [p2], (err) => {
        if (err) console.error('Error actualizando admin:', err.message);
        else console.log('✅ Password de admin maestro actualizada');
    });
});

db.close();
