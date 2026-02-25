const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

// "Base de Datos" Local
const DB_PATH = path.join(__dirname, 'pedidos.json');
const PROMOS_PATH = path.join(__dirname, 'promos.json');
let pedidos = [];
let promos = [];
let repartidoresOnline = {}; // { socketId: { nombre, id } }

// Cargar datos al iniciar
const loadDB = () => {
    if (fs.existsSync(DB_PATH)) {
        try {
            pedidos = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        } catch (e) { pedidos = []; }
    }
    if (fs.existsSync(PROMOS_PATH)) {
        try {
            promos = JSON.parse(fs.readFileSync(PROMOS_PATH, 'utf8'));
        } catch (e) { promos = []; }
    }
};

loadDB();

const saveDB = () => {
    fs.writeFileSync(DB_PATH, JSON.stringify(pedidos, null, 2));
};

const savePromos = () => {
    fs.writeFileSync(PROMOS_PATH, JSON.stringify(promos, null, 2));
    io.emit('promos_actualizadas', promos);
};

// --- ENDPOINTS API ---

app.post('/api/pedidos', (req, res) => {
    const nuevoPedido = {
        ...req.body,
        status: 'recibido',
        createdAt: req.body.createdAt || new Date().toISOString()
    };
    console.log(`📦 Nuevo Pedido Recibido: ${nuevoPedido.id}`);
    pedidos.push(nuevoPedido);
    saveDB();
    io.emit('nuevo_pedido', nuevoPedido);
    res.status(201).json({ success: true, data: nuevoPedido });
});

app.get('/api/pedidos', (req, res) => {
    res.json(pedidos);
});

app.get('/api/admin/stats', (req, res) => {
    const hoy = new Date().toISOString().split('T')[0];
    const pedidosHoy = pedidos.filter(p => {
        const pFecha = p.createdAt ? p.createdAt.split('T')[0] : '';
        return pFecha === hoy;
    });
    const revenueToday = pedidosHoy.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const recentOrders = [...pedidos].reverse().slice(0, 10);
    res.json({
        revenueToday,
        orderCount: pedidosHoy.length,
        recentOrders,
        totalOrders: pedidos.length
    });
});

app.patch('/api/pedidos/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, repartidor } = req.body;
    const index = pedidos.findIndex(p => p.id === id);

    if (index !== -1) {
        pedidos[index].status = status;
        if (repartidor) pedidos[index].repartidor = repartidor;
        if (status === 'entregado') pedidos[index].deliveredAt = new Date().toISOString();

        saveDB();
        console.log(`🔄 Pedido ${id} -> ${status} ${repartidor ? `(Asignado a: ${repartidor})` : ''}`);

        if (status === 'listo') {
            io.emit('pedido_listo_reparto', pedidos[index]);
        } else if (status === 'entregado') {
            io.emit('pedido_entregado_remoto', id);
        }
        io.emit('actualizacion_status_global', { id, status, repartidor });
        return res.json({ success: true, pedido: pedidos[index] });
    }
    res.status(404).json({ error: "Pedido no encontrado" });
});

app.get('/api/promos', (req, res) => res.json(promos));
app.post('/api/promos', (req, res) => {
    const nuevaPromo = { ...req.body, id: Date.now() };
    promos.push(nuevaPromo);
    savePromos();
    res.status(201).json(nuevaPromo);
});
app.put('/api/promos/:id', (req, res) => {
    const { id } = req.params;
    const index = promos.findIndex(p => p.id == id);
    if (index !== -1) {
        promos[index] = { ...promos[index], ...req.body, id: Number(id) };
        savePromos();
        return res.json(promos[index]);
    }
    res.status(404).json({ error: "Promo no encontrada" });
});
app.delete('/api/promos/:id', (req, res) => {
    promos = promos.filter(p => p.id != req.params.id);
    savePromos();
    res.json({ success: true });
});

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
    console.log('--- Conectado:', socket.id);

    socket.on('registro_repartidor', (nombre) => {
        repartidoresOnline[socket.id] = { nombre, socketId: socket.id };
        console.log(`🚛 Repartidor registrado: ${nombre}`);
        io.emit('repartidores_online', Object.values(repartidoresOnline));
    });

    socket.on('actualizar_menu', (updatedMenu) => {
        io.emit('menu_actualizado', updatedMenu);
    });

    socket.on('disconnect', () => {
        delete repartidoresOnline[socket.id];
        io.emit('repartidores_online', Object.values(repartidoresOnline));
        console.log('--- Desconectado:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 SERVIDOR CAPRICCIO en http://localhost:${PORT}`);
});
