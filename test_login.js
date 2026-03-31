const bcrypt = require('bcryptjs');
const db = require('./db');

async function test() {
    try {
        const username = 'capriccio_admin';
        const password = 'pizza2026';
        const role = 'admin';

        console.log('--- TESTING LOGIN MANUALLY ---');
        const result = await db.query(
            'SELECT * FROM usuarios WHERE LOWER(username) = LOWER($1) AND role = $2 AND activo = 1', 
            [username, role]
        );

        console.log('Rows found:', result.rows.length);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const valid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', valid);
            if (!valid) {
                console.log('Hashing new password for comparison...');
                const newHash = await bcrypt.hash(password, 10);
                console.log('Comparison with fresh hash of same password:', await bcrypt.compare(password, newHash));
                console.log('Original hash in DB:', user.password);
                console.log('Fresh hash local:', newHash);
            }
        } else {
            console.log('User not found with role', role);
        }
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
