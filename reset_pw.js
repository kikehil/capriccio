const db = require('./db');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const pass = await bcrypt.hash('pizza2026', 10);
        await db.query("UPDATE usuarios SET password = ? WHERE username = 'capriccio_admin'", [pass]);
        console.log('✅ Password for capriccio_admin reset to: pizza2026');
        
        const adminPass = await bcrypt.hash('CapriccioAdmin2026!', 10);
        await db.query("UPDATE usuarios SET password = ? WHERE username = 'admin'", [adminPass]);
        console.log('✅ Password for admin reset to: CapriccioAdmin2026!');
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
reset();
