const db = require('./db');

async function testQuery() {
    try {
        let result = await db.query(
            'SELECT u.*, n.nombre as negocio_nombre, n.plan FROM usuarios u LEFT JOIN negocios n ON u.negocio_id = n.id WHERE LOWER(u.username) = LOWER($1) AND u.role = $2 AND u.activo = 1', 
            ['capriccio', 'admin']
        );
        console.log("Success:", result.rows);
    } catch (err) {
        console.error("Query Error:", err);
    }
}
testQuery();
