const fs = require('fs');
const path = require('path');
const serverPath = '/var/www/html/capriccio/capriccio/server.js';
let content = fs.readFileSync(serverPath, 'utf8');

// Definir el nuevo bloque de login con separación de roles
const newLogin = `app.post('/api/auth/login', async (req, res) => {
    const { username, password, role_request } = req.body;
    console.log('[LOGIN] Intento:', { username, role_request });
    try {
        const MASTER_PASS = process.env.MASTER_ADMIN_PASSWORD || 'CapriccioAdmin2026!';
        
        // 1. DUEÑO DE PLATAFORMA (SUPER ADMIN)
        if (role_request === 'admin' && username?.toLowerCase() === 'admin' && password === MASTER_PASS) {
            console.log('[LOGIN] Maestro OK - Rol Platform');
            const token = jwt.sign({ username: 'admin', role: 'platform', plan: 'master' }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, role: 'platform', plan: 'master', negocio: 'Admin Demo', nombre: 'Dueño Plataforma' });
        }

        // 2. BUSQUEDA EN DB PARA OTROS
        let result = await db.query(
            'SELECT u.*, n.nombre as negocio_nombre, n.plan FROM usuarios u LEFT JOIN negocios n ON u.negocio_id = n.id WHERE LOWER(u.username) = LOWER($1) AND u.role = $2 AND u.activo = 1', 
            [username, role_request]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password);

        if (validPass) {
            const token = jwt.sign({ 
                id: user.id, username: user.username, role: user.role, 
                negocio_id: user.negocio_id, plan: user.plan || 'basico' 
            }, JWT_SECRET, { expiresIn: '7d' });
            
            return res.json({ 
                token, role: user.role, nombre: user.nombre_completo,
                plan: user.plan || 'basico', negocio: user.negocio_nombre || 'S/N'
            });
        }
        res.status(401).json({ error: 'Credenciales invalidas' });
    } catch (err) {
        console.error('[LOGIN] Error:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});`;

// Localizar el bloque de login existente
const searchStr = "app.post('/api/auth/login'";
const startIdx = content.indexOf(searchStr);
if (startIdx === -1) {
    console.error('No se encontró el bloque de login');
    process.exit(1);
}

// Buscar el final del bloque (hasta el next '});')
const endIdx = content.indexOf('});', startIdx) + 3;

const updatedContent = content.slice(0, startIdx) + newLogin + content.slice(endIdx);
fs.writeFileSync(serverPath, updatedContent);
console.log('✅ server.js patched with Role Separation');
