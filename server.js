require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'pizza-capriccio-super-secret-2026';

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password, role_request } = req.body;

    try {
        // Buscar usuario en DB
        const result = await db.query('SELECT * FROM usuarios WHERE username = $1 AND role = $2 AND activo = true', [username, role_request]);

        if (result.rows.length === 0) {
            // Fallback para admin/cocina si no se ha corrido el script de usuarios aún
            const ADMIN_PASS = process.env.ADMIN_PASS || 'CapriccioAdmin2026!';
            const COCINA_PASS = process.env.COCINA_PASS || 'CocinaCap2026!';

            if (role_request === 'admin' && username === 'admin' && password === ADMIN_PASS) {
                const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
                return res.json({ token, role: 'admin' });
            }
            if (role_request === 'cocina' && password === COCINA_PASS) {
                const token = jwt.sign({ username: 'cocina', role: 'cocina' }, JWT_SECRET, { expiresIn: '7d' });
                return res.json({ token, role: 'cocina' });
            }
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password);

        if (validPass) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, role: user.role, nombre: user.nombre_completo });
        }

        res.status(401).json({ error: 'Credenciales inválidas' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// --- API PRODUCTOS (CRUD) ---
app.delete('/api/productos/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        await db.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API USUARIOS / REPARTIDORES ---
app.get('/api/usuarios', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const result = await db.query('SELECT id, username, role, nombre_completo, activo, created_at FROM usuarios ORDER BY role, username');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/usuarios', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
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

app.put('/api/usuarios/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
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

app.delete('/api/usuarios/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        await db.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/productos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/productos', authenticateJWT, async (req, res) => {
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

app.patch('/api/productos/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const setClause = Object.keys(fields).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];

    try {
        const result = await db.query(
            `UPDATE productos SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );
        // Notificar a clientes del cambio en el menú
        const allProducts = await db.query('SELECT * FROM productos ORDER BY id ASC');
        io.emit('menu_actualizado', allProducts.rows);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PEDIDOS (TRANSACCIONAL) ---
app.get('/api/pedidos', authenticateJWT, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM pedidos WHERE status != 'entregado' ORDER BY created_at DESC LIMIT 100"
        );

        const pedidosConItems = await Promise.all(result.rows.map(async (pedido) => {
            const itemsRes = await db.query(
                `SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, d.precio_unitario as "totalItemPrice",
                        COALESCE(
                            json_agg(
                                json_build_object('nombre', e.extra_nombre, 'precio', e.precio_extra)
                            ) FILTER (WHERE e.id IS NOT NULL), '[]'
                        ) as extras
                 FROM detalle_pedidos d
                 LEFT JOIN extras_pedidos e ON d.id = e.detalle_id
                 WHERE d.pedido_id = $1
                 GROUP BY d.id`,
                [pedido.id]
            );

            return {
                ...pedido,
                id: pedido.order_id || pedido.id,
                order_id: pedido.order_id,
                createdAt: pedido.created_at,
                timestamp: pedido.created_at ? new Date(pedido.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : undefined,
                items: itemsRes.rows
            };
        }));

        res.json(pedidosConItems);
    } catch (err) {
        console.error('Error fetching pedidos GET:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { cliente_nombre, telefono, direccion, referencias, items, lat, lng } = req.body;
    const connection = await db.getTransaction();
    const crypto = require('crypto');
    const orderId = `ord-${crypto.randomBytes(3).toString('hex')}`;

    try {
        await connection.begin();

        // 1. Calcular el total real consultando la base de datos
        let totalCalculado = 0;
        const productosRes = await connection.client.query('SELECT nombre, precio FROM productos');
        const productosMap = new Map();
        productosRes.rows.forEach(p => productosMap.set(p.nombre, Number(p.precio)));

        const itemsValidados = items.map(item => {
            const precioBase = productosMap.get(item.nombre);
            const precioSeguro = precioBase !== undefined ? precioBase : Number(item.totalItemPrice || 0);

            const extrasSum = (item.extras || []).reduce((acc, ex) => acc + Number(ex.precio || 0), 0);
            const totalItemSeguro = precioSeguro + extrasSum;

            totalCalculado += totalItemSeguro * item.quantity;

            return {
                ...item,
                totalItemPriceSeguro: totalItemSeguro
            };
        });

        // 2. Insertar en tabla pedidos
        const pedidoRes = await connection.client.query(
            `INSERT INTO pedidos (order_id, cliente_nombre, telefono, direccion, referencias, total, lat, lng) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [orderId, cliente_nombre, telefono, direccion, referencias, totalCalculado, lat, lng]
        );
        const pedidoId = pedidoRes.rows[0].id;

        // 3. Insertar items y extras
        for (const item of itemsValidados) {
            const itemRes = await connection.client.query(
                `INSERT INTO detalle_pedidos (pedido_id, pizza_nombre, cantidad, precio_unitario) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [pedidoId, item.nombre, item.quantity, item.totalItemPriceSeguro]
            );
            const detailId = itemRes.rows[0].id;

            if (item.extras && item.extras.length > 0) {
                for (const extra of item.extras) {
                    await connection.client.query(
                        `INSERT INTO extras_pedidos (detalle_id, extra_nombre, precio_extra) 
                         VALUES ($1, $2, $3)`,
                        [detailId, extra.nombre, extra.precio]
                    );
                }
            }
        }

        await connection.commit();

        const timestampStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const pedidoCompleto = {
            ...req.body,
            id: orderId,
            order_id: orderId,
            db_id: pedidoId,
            status: 'pendiente',
            total: totalCalculado,
            timestamp: timestampStr,
            createdAt: new Date().toISOString()
        };
        console.log(`🚀 Pedido ${orderId} procesado exitosamente en Postgres. Total calculado: $${totalCalculado}`);

        // Emitir a Cocina y Admin
        io.emit('nuevo_pedido', pedidoCompleto);

        res.status(201).json({ success: true, id: pedidoId, order_id: orderId });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Error en transacción de pedido:', err);
        res.status(500).json({ error: 'Fallo al procesar pedido en DB' });
    } finally {
        connection.release();
    }
});

app.get('/api/pedidos/status/:status', authenticateJWT, async (req, res) => {
    const { status } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM pedidos WHERE status = $1 ORDER BY created_at DESC',
            [status]
        );

        // Cargar items para cada pedido para que el repartidor los vea con extras incluídos
        const pedidosConItems = await Promise.all(result.rows.map(async (pedido) => {
            const itemsRes = await db.query(
                `SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, 
                        COALESCE(
                            json_agg(
                                json_build_object('nombre', e.extra_nombre)
                            ) FILTER (WHERE e.id IS NOT NULL), '[]'
                        ) as extras
                 FROM detalle_pedidos d
                 LEFT JOIN extras_pedidos e ON d.id = e.detalle_id
                 WHERE d.pedido_id = $1
                 GROUP BY d.id, d.pizza_nombre, d.cantidad`,
                [pedido.id]
            );
            return { ...pedido, items: itemsRes.rows };
        }));

        res.json(pedidosConItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pedidos/:id/status', authenticateJWT, async (req, res) => {
    const { id } = req.params; // order_id string
    const { status, repartidor } = req.body;

    try {
        let result;
        if (repartidor) {
            if (status === 'entregado') {
                result = await db.query(
                    'UPDATE pedidos SET status = $1, repartidor = $2, delivered_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *',
                    [status, repartidor, id]
                );
            } else {
                result = await db.query(
                    'UPDATE pedidos SET status = $1, repartidor = $2 WHERE order_id = $3 RETURNING *',
                    [status, repartidor, id]
                );
            }
        } else {
            if (status === 'entregado') {
                result = await db.query(
                    'UPDATE pedidos SET status = $1, delivered_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *',
                    [status, id]
                );
            } else {
                result = await db.query(
                    'UPDATE pedidos SET status = $1 WHERE order_id = $2 RETURNING *',
                    [status, id]
                );
            }
        }

        const pedido = result.rows[0];
        if (!pedido) {
            console.error(`❌ [STATUS CHANGE ERROR] No se encontró pedido con order_id: ${id}`);
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        console.log(`✅ [STATUS CHANGE SUCCESS] Order ${id} -> ${status} (Repartidor: ${pedido.repartidor || 'S/A'}). Filas afectadas: ${result.rowCount}`);

        // --- SIMULACIÓN WHATSAPP ---
        if (status === 'en_camino') {
            console.log(`📱 [WhatsApp Simulator] Enviando a ${pedido.telefono}: 
            "¡Hola ${pedido.cliente_nombre}! Tu pizza de Pizza Capriccio ya va en camino. Estará ahí en minutos. 🛵💨"`);
        }

        // --- LOGÍSTICA SOCKETS ---
        if (status === 'listo') {
            const itemsRes = await db.query(
                `SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, 
                        COALESCE(
                            json_agg(
                                json_build_object('nombre', e.extra_nombre)
                            ) FILTER (WHERE e.id IS NOT NULL), '[]'
                        ) as extras
                 FROM detalle_pedidos d
                 LEFT JOIN extras_pedidos e ON d.id = e.detalle_id
                 WHERE d.pedido_id = $1
                 GROUP BY d.id, d.pizza_nombre, d.cantidad`,
                [pedido.id]
            );
            const fullPedido = {
                ...pedido,
                order_id: pedido.order_id,
                items: itemsRes.rows
            };
            console.log("📢 Emitiendo pedido a repartidores:", fullPedido.order_id);
            io.emit('pedido_listo_reparto', fullPedido);
        } else if (status === 'entregado') {
            io.emit('pedido_entregado_remoto', id);
        }

        io.emit('actualizacion_status_global', { id, status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API PROMOCIONES ---
app.get('/api/promos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM promociones WHERE activo = true ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/promos', authenticateJWT, async (req, res) => {
    const { titulo, subtitulo, precio, color, imagen, badge } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO promociones (titulo, subtitulo, precio, color, imagen, badge) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [titulo, subtitulo, precio, color, imagen, badge]
        );
        const allPromos = await db.query('SELECT * FROM promociones WHERE activo = true ORDER BY id ASC');
        io.emit('promos_actualizadas', allPromos.rows);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/promos/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { titulo, subtitulo, precio, color, imagen, badge } = req.body;
    try {
        const result = await db.query(
            'UPDATE promociones SET titulo=$1, subtitulo=$2, precio=$3, color=$4, imagen=$5, badge=$6 WHERE id=$7 RETURNING *',
            [titulo, subtitulo, precio, color, imagen, badge, id]
        );
        const allPromos = await db.query('SELECT * FROM promociones WHERE activo = true ORDER BY id ASC');
        io.emit('promos_actualizadas', allPromos.rows);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/promos/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM promociones WHERE id=$1', [id]);
        const allPromos = await db.query('SELECT * FROM promociones WHERE activo = true ORDER BY id ASC');
        io.emit('promos_actualizadas', allPromos.rows);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN STATS ---
app.get('/api/admin/stats', authenticateJWT, async (req, res) => {
    try {
        const ventasHoy = await db.query(
            "SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE created_at >= CURRENT_DATE"
        );
        const topPizzas = await db.query(`
            SELECT pizza_nombre, COUNT(*) as cantidad 
            FROM detalle_pedidos 
            GROUP BY pizza_nombre 
            ORDER BY cantidad DESC 
            LIMIT 3
        `);

        const pedidosHoy = await db.query(
            "SELECT COUNT(*) as count FROM pedidos WHERE created_at >= CURRENT_DATE"
        );

        res.json({
            revenueToday: parseFloat(ventasHoy.rows[0].total),
            orderCount: parseInt(pedidosHoy.rows[0].count),
            topThree: topPizzas.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN REPORTS ---
app.get('/api/admin/reportes', authenticateJWT, async (req, res) => {
    const { inicio, fin } = req.query;
    try {
        let queryStr = 'SELECT * FROM pedidos';
        const params = [];

        if (inicio && fin) {
            // Include entire day for the end date by adding '23:59:59'
            queryStr += ' WHERE Date(created_at) >= $1 AND created_at <= $2::timestamp + interval \'1 day\' - interval \'1 second\'';
            params.push(inicio, fin);
        } else if (inicio) {
            queryStr += ' WHERE Date(created_at) >= $1';
            params.push(inicio);
        } else if (fin) {
            queryStr += ' WHERE created_at <= $1::timestamp + interval \'1 day\' - interval \'1 second\'';
            params.push(fin);
        }

        queryStr += ' ORDER BY created_at DESC';
        const result = await db.query(queryStr, params);

        const pedidosConItems = await Promise.all(result.rows.map(async (pedido) => {
            const itemsRes = await db.query(
                `SELECT d.id, d.pizza_nombre as nombre, d.cantidad as quantity, d.precio_unitario as "totalItemPrice",
                        COALESCE(
                            json_agg(
                                json_build_object('nombre', e.extra_nombre, 'precio', e.precio_extra)
                            ) FILTER (WHERE e.id IS NOT NULL), '[]'
                        ) as extras
                 FROM detalle_pedidos d
                 LEFT JOIN extras_pedidos e ON d.id = e.detalle_id
                 WHERE d.pedido_id = $1
                 GROUP BY d.id`,
                [pedido.id]
            );
            return {
                ...pedido,
                id: pedido.order_id || pedido.id.toString(),
                createdAt: pedido.created_at,
                deliveredAt: pedido.delivered_at,
                timestamp: pedido.created_at ? new Date(pedido.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : undefined,
                items: itemsRes.rows,
                // Add explicit delivered status for PDF/table UI
                pago_confirmado: true
            };
        }));

        res.json(pedidosConItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SOCKETS ---
let repartidoresOnline = {}; // { socketId: { nombre, id } }

io.on('connection', (socket) => {
    console.log('--- Dispositivo conectado:', socket.id);

    // Enviar lista actual inmediatamente a quien se conecta
    socket.emit('repartidores_online', Object.values(repartidoresOnline));

    socket.on('registro_repartidor', (nombre) => {
        repartidoresOnline[socket.id] = { nombre, socketId: socket.id };
        console.log(`🚛 Repartidor registrado: ${nombre}`);
        io.emit('repartidores_online', Object.values(repartidoresOnline));
    });

    socket.on('actualizar_menu', async (updatedMenu) => {
        io.emit('menu_actualizado', updatedMenu);
    });

    socket.on('disconnect', () => {
        if (repartidoresOnline[socket.id]) {
            delete repartidoresOnline[socket.id];
            io.emit('repartidores_online', Object.values(repartidoresOnline));
        }
        console.log('--- Dispositivo desconectado:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 SERVIDOR CAPRICCIO PROFESIONAL en http://localhost:${PORT}`);
});
