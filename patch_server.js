const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverPath, 'utf8');

// 1. Replace first queries (GET /api/pedidos and admin reportes have similar json_agg)
code = code.replace(/const itemsRes = await db\.query\([\s\S]*?`SELECT d\.id, d\.pizza_nombre as nombre, d\.cantidad as quantity, d\.precio_unitario as "totalItemPrice"[\s\S]*?GROUP BY d\.id`,[\s\S]*?\[pedido\.id\]\s*\);/g, 
`const itemsRes = await db.query('SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, d.precio_unitario as "totalItemPrice" FROM detalle_pedidos d WHERE d.pedido_id = $1', [pedido.id]);
            for (let item of itemsRes.rows) {
                const ext = await db.query('SELECT extra_nombre as nombre, precio_extra as precio FROM extras_pedidos WHERE detalle_id = $1', [item.id]);
                item.extras = ext.rows || [];
            }`);

// 2. Replace second query (status filtering without precio_extra)
code = code.replace(/const itemsRes = await db\.query\([\s\S]*?`SELECT d\.id, d\.pizza_nombre as nombre, d\.cantidad as quantity,[\s\S]*?GROUP BY d\.id, d\.pizza_nombre, d\.cantidad`,[\s\S]*?\[pedido\.id\]\s*\);/g,
`const itemsRes = await db.query('SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity FROM detalle_pedidos d WHERE d.pedido_id = $1', [pedido.id]);
            for (let item of itemsRes.rows) {
                const ext = await db.query('SELECT extra_nombre as nombre FROM extras_pedidos WHERE detalle_id = $1', [item.id]);
                item.extras = ext.rows || [];
            }`);

// 3. Replace DATE conditions in /api/admin/reportes
code = code.replace(/queryStr \+= ' WHERE Date\(created_at\) >= \$1 AND created_at <= \$2::timestamp \+ interval \\'1 day\\' - interval \\'1 second\\'';/g,
`queryStr += ' WHERE date(created_at) >= date($1) AND date(created_at) <= date($2)';`);
code = code.replace(/queryStr \+= ' WHERE created_at <= \$1::timestamp \+ interval \\'1 day\\' - interval \\'1 second\\'';/g,
`queryStr += ' WHERE date(created_at) <= date($1)';`);


// 4. Replace Corte de caja json_agg logic
code = code.replace(/const result = await db\.query\(`\s*SELECT \s*repartidor,\s*COUNT\(\*\) as total_pedidos,\s*SUM\(total\) as total_efectivo,\s*json_agg\([\s\S]*?GROUP BY repartidor\s*`\);\s*res\.json\(result\.rows\);/g,
`const rows = await db.query("SELECT repartidor, id, order_id, cliente_nombre, total, delivered_at FROM pedidos WHERE status = 'entregado' AND liquidado = 0");
        const aggs = {};
        for(let r of rows.rows) {
            let key = r.repartidor || 'Sin Asignar';
            if(!aggs[key]) aggs[key] = { repartidor: key, total_pedidos: 0, total_efectivo: 0, pedidos: [] };
            aggs[key].total_pedidos++;
            aggs[key].total_efectivo += Number(r.total);
            aggs[key].pedidos.push(r);
        }
        res.json(Object.values(aggs));`);


// 5. Array parsing correctly for PostgreSQL arrays ANY($2)
code = code.replace(/WHERE order_id = ANY\(\$2\)/g, `WHERE order_id IN (\${order_ids.map(id => \`'\${id}'\`).join(',')}) /* ANY replaced */`);
code = code.replace(/\[liquidado_por \|\| 'Cajero Admin', order_ids\]/g, `[liquidado_por || 'Cajero Admin']`);


fs.writeFileSync(serverPath, code, 'utf8');
console.log("server.js parcheado para sqlite local!");
