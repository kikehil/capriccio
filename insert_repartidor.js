const db = require('./db');
const bcrypt = require('bcryptjs');

async function createRepartidor() {
    try {
        const username = 'repartidor';
        const rawPassword = 'RepartoCap2026!';
        const role = 'repartidor';
        
        // Hashear password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        
        // Verificar si existe
        const existing = await db.query('SELECT * FROM usuarios WHERE role = $1', [role]);
        
        if (existing.rows && existing.rows.length > 0) {
            console.log("El repartidor ya existe. Actualizando la contraseña...");
            await db.query('UPDATE usuarios SET password = $1 WHERE role = $2', [hashedPassword, role]);
        } else {
            console.log("Creando nuevo usuario repartidor...");
            await db.query(
                "INSERT INTO usuarios (username, password, role, nombre_completo, activo) VALUES ($1, $2, $3, 'Repartidor Capriccio', 1)", 
                [username, hashedPassword, role]
            );
        }
        
        console.log("✅ Credencial de repartidor lista!");
        console.log(`Usuario: ${username}`);
        console.log(`Contraseña: ${rawPassword}`);
        
        process.exit(0);
    } catch(err) {
        console.error("Error al crear repartidor:", err);
        process.exit(1);
    }
}

createRepartidor();
