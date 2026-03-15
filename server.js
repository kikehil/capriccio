require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'pizza-capriccio-super-secret-2026';

// --- MIDDLEWARES DE SEGURIDAD ---
const authorize = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
            
            // RBAC: Si se definieron roles, validar que el usuario tenga el permiso adecuado
            if (roles.length > 0 && !roles.includes(user.role)) {
                return res.status(403).json({ error: 'No tienes permisos para esta acción' });
            }

            req.user = user;
            next();
        });
    };
};

// Aliases para facilitar lectura
const authenticateJWT = authorize([]); // Cualquier rol válido
const adminOnly = authorize(['admin']);
const kitchenOrAdmin = authorize(['admin', 'cocina']);
const deliveryOrAdmin = authorize(['admin', 'repartidor']);
const staffOnly = authorize(['admin', 'cocina', 'repartidor']);

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password, role_request } = req.body;
    try {
        const MASTER_PASS = process.env.MASTER_ADMIN_PASSWORD || 'CapriccioAdmin2026!';
        if (role_request === 'admin' && username?.toLowerCase() === 'admin' && password === MASTER_PASS) {
            const token = jwt.sign({ username: 'admin', role: 'admin', plan: 'premium' }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, role: 'admin', plan: 'premium', negocio: 'Admin Demo' });
        }

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
                id: user.id, 
                username: user.username, 
                role: user.role,
                negocio_id: user.negocio_id,
                plan: user.plan || 'basico'
            }, JWT_SECRET, { expiresIn: '7d' });
            
            return res.json({ 
                token, 
                role: user.role, 
                nombre: user.nombre_completo,
                plan: user.plan || 'basico',
                negocio: user.negocio_nombre || 'S/N'
            });
        }
        res.status(401).json({ error: 'Credenciales invalidas' });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// --- API USUARIOS ---
app.get('/api/usuarios', adminOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, role, nombre_completo, activo, created_at FROM usuarios ORDER BY role, username');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/usuarios', adminOnly, async (req, res) => {
    const { username, password, role, nombre_completo } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO usuarios (username, password, role, nombre_completo) VALUES ($1, $2, $3, $4) RETURNING id, username, role, nombre_completo',
            [username, hashedPassword, role, nombre_completo]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/usuarios/:id', adminOnly, async (req, res) => {
    const { username, password, role, nombre_completo, activo } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE usuarios SET username=$1, password=$2, role=$3, nombre_completo=$4, activo=$5 WHERE id=$6',
                [username, hashedPassword, role, nombre_completo, activo, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET username=$1, role=$2, nombre_completo=$3, activo=$4 WHERE id=$5',
                [username, role, nombre_completo, activo, req.params.id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/usuarios/:id', adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/productos', adminOnly, async (req, res) => {
    const { nombre, descripcion, precio, imagen, categoria, activo } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion, precio, imagen, categoria, activo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/productos/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.sendStatus(400);

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];

    try {
        const result = await db.query(`UPDATE productos SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
        const allProducts = await db.query('SELECT * FROM productos ORDER BY id ASC');
        io.emit('menu_actualizado', allProducts.rows);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/productos/:id', adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PROMOCIONES ---
app.get('/api/promos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM promociones WHERE activo = 1 ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/promos', adminOnly, async (req, res) => {
    const { titulo, subtitulo, precio, color, imagen, badge } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO promociones (titulo, subtitulo, precio, color, imagen, badge, activo) VALUES ($1, $2, $3, $4, $5, $6, 1) RETURNING *',
            [titulo, subtitulo, precio, color, imagen, badge]
        );
        const all = await db.query('SELECT * FROM promociones WHERE activo = 1 ORDER BY id ASC');
        io.emit('promos_actualizadas', all.rows);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/promos/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    const { titulo, subtitulo, precio, color, imagen, badge } = req.body;
    try {
        const result = await db.query(
            'UPDATE promociones SET titulo=$1, subtitulo=$2, precio=$3, color=$4, imagen=$5, badge=$6 WHERE id=$7 RETURNING *',
            [titulo, subtitulo, precio, color, imagen, badge, id]
        );
        const all = await db.query('SELECT * FROM promociones WHERE activo = 1 ORDER BY id ASC');
        io.emit('promos_actualizadas', all.rows);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/promos/:id', adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE promociones SET activo = 0 WHERE id = $1', [id]);
        const all = await db.query('SELECT * FROM promociones WHERE activo = 1 ORDER BY id ASC');
        io.emit('promos_actualizadas', all.rows);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PEDIDOS ---
app.get('/api/pedidos', staffOnly, async (req, res) => {
    try {
        let baseQuery = "SELECT * FROM pedidos";
        let params = [];
        
        // Seguridad: Si el usuario es repartidor, solo mostramos pedidos recolectados por él
        // o pedidos listos para ser tomados por cualquiera.
        if (req.user.role === 'repartidor') {
            baseQuery += " WHERE status IN ('listo', 'en_camino', 'entregado')";
        }
        
        const result = await db.query(`${baseQuery} ORDER BY created_at DESC LIMIT 100`, params);
        const pedidosConItems = await Promise.all(result.rows.map(async (pedido) => {
            const itemsRes = await db.query('SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, d.precio_unitario as "totalItemPrice", d.size, d.crust FROM detalle_pedidos d WHERE d.pedido_id = $1', [pedido.id]);
            for (let item of itemsRes.rows) {
                const ext = await db.query('SELECT extra_nombre as nombre, precio_extra as precio FROM extras_pedidos WHERE detalle_id = $1', [item.id]);
                item.extras = ext.rows || [];
            }

            // Confidencialidad: Ocultar datos sensibles si no es SU pedido o no está asignado
            const isAuthorizedToSeeDetails = req.user.role === 'admin' || 
                                           req.user.role === 'cocina' || 
                                           (req.user.role === 'repartidor' && (pedido.repartidor === req.user.username || pedido.status === 'listo'));

            return {
                ...pedido,
                id: pedido.order_id || pedido.id,
                items: itemsRes.rows,
                // Si no está autorizado, ofuscamos el teléfono y dirección exacta
                telefono: isAuthorizedToSeeDetails ? pedido.telefono : pedido.telefono.replace(/.(?=.{4})/g, '*'),
                direccion: isAuthorizedToSeeDetails ? pedido.direccion : "DIRECCIÓN PROTEGIDA (Asignate el pedido para ver)"
            };
        }));
        res.json(pedidosConItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { cliente_nombre, telefono, direccion, referencias, items, lat, lng } = req.body;
    
    // 1. Basic Field Validation
    if (!cliente_nombre || !telefono || !direccion || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para el pedido' });
    }

    const connection = await db.getTransaction();
    const crypto = require('crypto');
    const orderId = `ord-${crypto.randomBytes(3).toString('hex')}`;

    try {
        await connection.begin();
        
        let validatedTotal = 0;
        const validatedItems = [];

        // 2. Fetch all active products for validation
        const productsRes = await db.query("SELECT * FROM productos WHERE activo = 1");
        const catalog = productsRes.rows;

        for (const item of items) {
            // Validate Quantity
            if (!item.quantity || item.quantity <= 0) {
                throw new Error(`Cantidad inválida para ${item.nombre || 'el producto'}`);
            }

            let unitPrice = 0;
            const isPromo = item.nombre && item.nombre.toLowerCase().startsWith('promo:');

            if (isPromo) {
                // Hardcoded validation for Combo Builder
                if (item.nombre.includes('2 Medianas')) unitPrice = 245;
                else if (item.nombre.includes('2 Grandes')) unitPrice = 275;
                else unitPrice = Number(item.totalItemPrice); // Fallback if unknown
            } else {
                // Find product in catalog
                const product = catalog.find(p => p.nombre.toLowerCase() === item.nombre.toLowerCase());
                if (product) {
                    const prices = typeof product.precios === 'string' ? JSON.parse(product.precios) : product.precios;
                    if (item.size && prices && prices[item.size.toLowerCase()]) {
                        unitPrice = prices[item.size.toLowerCase()];
                    } else {
                        unitPrice = product.precio || 0;
                    }

                    // Add extras cost if any
                    if (item.extras && Array.isArray(item.extras)) {
                        for (const ex of item.extras) {
                            unitPrice += Number(ex.precio || 0);
                        }
                    }
                } else {
                    // Item not in DB? Fallback to client price but flag it if we were strict
                    unitPrice = Number(item.totalItemPrice);
                }
            }

            validatedTotal += (unitPrice * item.quantity);
            validatedItems.push({ ...item, totalItemPrice: unitPrice });
        }

        const pedidoRes = await connection.client.query(
            `INSERT INTO pedidos (order_id, cliente_nombre, telefono, direccion, referencias, total, lat, lng) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [orderId, cliente_nombre, telefono, direccion, referencias, validatedTotal, lat, lng]
        );
        const pedidoId = pedidoRes.rows[0].id;

        for (const item of validatedItems) {
            const itemRes = await connection.client.query(
                `INSERT INTO detalle_pedidos (pedido_id, pizza_nombre, cantidad, precio_unitario, size, crust) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [pedidoId, item.nombre, item.quantity, item.totalItemPrice, item.size || null, item.crust || null]
            );
            const detailId = itemRes.rows[0].id;

            if (item.extras && item.extras.length > 0) {
                for (const extra of item.extras) {
                    await connection.client.query(
                        `INSERT INTO extras_pedidos (detalle_id, extra_nombre, precio_extra) VALUES ($1, $2, $3)`,
                        [detailId, extra.nombre, extra.precio]
                    );
                }
            }
        }

        await connection.commit();
        io.emit('nuevo_pedido', { 
            cliente_nombre, 
            telefono, 
            direccion, 
            order_id: orderId, 
            total: validatedTotal, 
            status: 'pendiente',
            items: validatedItems 
        });
        res.status(201).json({ success: true, order_id: orderId });
    } catch (err) {
        await connection.rollback();
        console.error("Order Error:", err.message);
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.patch('/api/pedidos/:id/status', staffOnly, async (req, res) => {
    const { id } = req.params;
    const { status, repartidor } = req.body;
    try {
        let updateQuery = 'UPDATE pedidos SET status = $1, repartidor = $2 WHERE order_id = $3 RETURNING *';
        let values = [status, repartidor || 'S/A', id];
        if (status === 'entregado') {
            updateQuery = 'UPDATE pedidos SET status = $1, repartidor = $2, delivered_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *';
        }
        const result = await db.query(updateQuery, values);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        const pedido = result.rows[0];
        io.emit(status === 'listo' ? 'pedido_listo_reparto' : 'pedido_entregado_remoto', pedido);
        res.json({ success: true, pedido });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pedidos/status/:status', staffOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pedidos WHERE status = $1 ORDER BY created_at DESC', [req.params.status]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Helper to get current day in Business Timezone (Pánuco UTC-6)
const getBusinessDate = (dateParam = null) => {
    // Si no hay dateParam, usamos la fecha actual del sistema
    const d = dateParam ? new Date(dateParam) : new Date();
    
    // Convertimos la fecha actual a la zona horaria especificada (America/Mexico_City para Pánuco)
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
};

// --- ADMIN STATS & REPORTS ---
app.get('/api/admin/stats', adminOnly, async (req, res) => {
    try {
        const today = getBusinessDate();
        const negocio_id = req.user.negocio_id;
        const logMsg = `[Stats] User: ${req.user.username}, Negocio: ${negocio_id}, Date: ${today}\n`;
        fs.appendFileSync('stats_debug.log', logMsg);

        // Simple query without offset first to see if it works, 
        // using date(created_at) because it's already local in DB
        let baseQuery = "WHERE date(created_at) = $1 AND status != 'cancelado'";
        let params = [today];

        if (negocio_id) {
            if (negocio_id == 1) baseQuery += " AND (negocio_id = $2 OR negocio_id IS NULL)";
            else baseQuery += " AND negocio_id = $2";
            params.push(negocio_id);
        }

        const revenueRes = await db.query(`SELECT SUM(total) as revenue FROM pedidos ${baseQuery}`, params);
        const countsRes = await db.query(`SELECT COUNT(*) as count FROM pedidos ${baseQuery}`, params);
        
        let liqQuery = "WHERE date(created_at) = $1 AND liquidado = 1";
        if (negocio_id) {
            if (negocio_id == 1) liqQuery += " AND (negocio_id = $2 OR negocio_id IS NULL)";
            else liqQuery += " AND negocio_id = $2";
        }
        const liquidatedRes = await db.query(`SELECT SUM(total) as total FROM pedidos ${liqQuery}`, params);
        
        const recentRes = await db.query("SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 10");
        const recentOrdersWithItems = await Promise.all(recentRes.rows.map(async (p) => {
            const items = await db.query('SELECT d.*, d.pizza_nombre as nombre FROM detalle_pedidos d WHERE d.pedido_id = $1', [p.id]);
            const itemsWithExtras = await Promise.all(items.rows.map(async (item) => {
                const extras = await db.query('SELECT extra_nombre as nombre, precio_extra as precio FROM extras_pedidos WHERE detalle_id = $1', [item.id]);
                return { ...item, extras: extras.rows };
            }));
            return { ...p, items: itemsWithExtras };
        }));

        const stats = {
            revenueToday: Number(revenueRes.rows[0]?.revenue || 0),
            orderCount: Number(countsRes.rows[0]?.count || 0),
            liquidatedToday: Number(liquidatedRes.rows[0]?.total || 0),
            recentOrders: recentOrdersWithItems
        };
        fs.appendFileSync('stats_debug.log', `[Stats] Result: ${JSON.stringify(stats)}\n`);
        res.json(stats);
    } catch (err) {
        fs.appendFileSync('stats_debug.log', `[Stats] ERROR: ${err.message}\n`);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/reportes', adminOnly, async (req, res) => {
    const { inicio, fin } = req.query;
    try {
        let queryStr = "SELECT * FROM pedidos";
        let params = [];
        if (inicio && fin) {
            queryStr += " WHERE date(created_at, '-6 hours') >= $1 AND date(created_at, '-6 hours') <= $2";
            params = [inicio, fin];
        } else if (inicio) {
            queryStr += " WHERE date(created_at, '-6 hours') = $1";
            params = [inicio];
        }
        queryStr += " ORDER BY created_at DESC";
        const result = await db.query(queryStr, params);

        const data = await Promise.all(result.rows.map(async (p) => {
            const items = await db.query('SELECT d.*, d.pizza_nombre as nombre FROM detalle_pedidos d WHERE d.pedido_id = $1', [p.id]);
            const itemsWithExtras = await Promise.all(items.rows.map(async (item) => {
                const extras = await db.query('SELECT extra_nombre as nombre, precio_extra as precio FROM extras_pedidos WHERE detalle_id = $1', [item.id]);
                return { ...item, extras: extras.rows };
            }));
            return { ...p, items: itemsWithExtras };
        }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/admin/liquidar-pedidos', adminOnly, async (req, res) => {
    const { order_ids, liquidado_por } = req.body;
    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) return res.status(400).json({ error: 'Lista vacia' });
    try {
        const idsString = order_ids.map(id => `'${id}'`).join(',');
        await db.query(`UPDATE pedidos SET liquidado = 1, liquidado_at = CURRENT_TIMESTAMP, liquidado_por = $1 WHERE order_id IN (${idsString})`, [liquidado_por || 'Cajero Admin']);
        io.emit('pedidos_liquidados', { order_ids });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/corte-caja', adminOnly, async (req, res) => {
    try {
        const rows = await db.query("SELECT * FROM pedidos WHERE (status = 'entregado' OR status = 'despachado' OR status = 'listo') AND liquidado = 0");
        const aggs = {};
        rows.rows.forEach(r => {
            let key = r.repartidor || 'Sin Asignar';
            if(!aggs[key]) aggs[key] = { repartidor: key, total_pedidos: 0, total_efectivo: 0, pedidos: [] };
            aggs[key].total_pedidos++;
            aggs[key].total_efectivo += Number(r.total);
            aggs[key].pedidos.push(r);
        });
        res.json(Object.values(aggs));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PLATFORM ---
app.get('/api/platform/negocios', adminOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM negocios ORDER BY fecha_alta DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SOCKETS & START
io.on('connection', (socket) => {
    socket.on('actualizar_menu', (m) => io.emit('menu_actualizado', m));
});

const PORT = 3001;
server.listen(PORT, () => console.log(`🚀 SERVIDOR EN PUERTO ${PORT}`));
