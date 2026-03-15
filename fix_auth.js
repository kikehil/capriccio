const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const newLoginLogic = `app.post('/api/auth/login', async (req, res) => {
    const { username, password, role_request } = req.body;
    console.log('Login attempt:', { username, role_request });

    try {
        // Fallback inmediato para administrador maestro
        const ADMIN_PASS = 'CapriccioAdmin2026!';
        if (role_request === 'admin' && username?.toLowerCase() === 'admin' && password === ADMIN_PASS) {
            console.log('Master admin logged in via fallback');
            const token = require('jsonwebtoken').sign({ username: 'admin', role: 'admin', plan: 'premium' }, process.env.JWT_SECRET || 'pizza-cerebro-super-secret-2026', { expiresIn: '7d' });
            return res.json({ token, role: 'admin', plan: 'premium', negocio: 'Admin Demo' });
        }

        let result = { rows: [] };
        try {
            // Join con negocios para saber qu\u00e9 plan tiene
            result = await db.query(
                'SELECT u.*, n.nombre as negocio_nombre, n.plan FROM usuarios u LEFT JOIN negocios n ON u.negocio_id = n.id WHERE LOWER(u.username) = LOWER(\$1) AND u.role = \$2 AND u.activo = 1', 
                [username, role_request]
            );
        } catch (dbError) {
            console.log('\u26a0\ufe0f Aviso DB:', dbError.message);
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inv\u00e1lidas' });
        }

        const user = result.rows[0];
        const validPass = await require('bcryptjs').compare(password, user.password);

        if (validPass) {
            const token = require('jsonwebtoken').sign({ 
                id: user.id, 
                username: user.username, 
                role: user.role,
                negocio_id: user.negocio_id,
                plan: user.plan || 'basico'
            }, process.env.JWT_SECRET || 'pizza-cerebro-super-secret-2026', { expiresIn: '7d' });
            
            return res.json({ 
                token, 
                role: user.role, 
                nombre: user.nombre_completo,
                plan: user.plan || 'basico',
                negocio: user.negocio_nombre || 'S/N'
            });
        }

        res.status(401).json({ error: 'Credenciales inv\u00e1lidas' });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});`;

// Find the login block and replace it
const startTag = 'app.post(\'/api/auth/login\'';
const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf('});', startIdx) + 3;

if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + newLoginLogic + content.slice(endIdx);
    fs.writeFileSync('server.js', content, 'utf8');
    console.log('server.js updated successfully');
} else {
    console.error('Login block not found');
}
