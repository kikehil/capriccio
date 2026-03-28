/**
 * init-db.js — Inicializa la base de datos SQLite con todas las tablas necesarias
 * Uso: node init-db.js
 */
require('dotenv').config();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

async function init() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.run('PRAGMA foreign_keys = ON');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS negocios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL DEFAULT 'Capriccio Pizzeria',
            plan TEXT NOT NULL DEFAULT 'premium',
            fecha_alta DATETIME DEFAULT (datetime('now','localtime')),
            ultimo_corte_turno DATETIME
        );
    `);
    const negocioExiste = await db.get("SELECT id FROM negocios LIMIT 1");
    if (!negocioExiste) {
        await db.run("INSERT INTO negocios (nombre, plan) VALUES ('Capriccio Pizzeria', 'premium')");
        console.log('Negocio creado');
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'caja',
            nombre_completo TEXT,
            activo INTEGER NOT NULL DEFAULT 1,
            negocio_id INTEGER REFERENCES negocios(id),
            created_at DATETIME DEFAULT (datetime('now','localtime'))
        );
    `);

    const adminPass = process.env.MASTER_ADMIN_PASSWORD || 'CapriccioAdmin2026!';
    const hash = await bcrypt.hash(adminPass, 10);
    const negocio = await db.get("SELECT id FROM negocios LIMIT 1");
    const usuariosBase = [
        { username: 'capriccio', role: 'admin', nombre: 'Capriccio Admin' },
        { username: 'cocina',    role: 'cocina', nombre: 'Cocina' },
        { username: 'caja',      role: 'caja',   nombre: 'Caja' },
        { username: 'reparto',   role: 'repartidor', nombre: 'Reparto' },
    ];
    for (const u of usuariosBase) {
        const existe = await db.get("SELECT id FROM usuarios WHERE username = ?", [u.username]);
        if (!existe) {
            await db.run("INSERT INTO usuarios (username, password, role, nombre_completo, negocio_id) VALUES (?,?,?,?,?)",
                [u.username, hash, u.role, u.nombre, negocio.id]);
            console.log('Usuario creado: ' + u.username + ' (' + u.role + ')');
        }
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL DEFAULT 0,
            imagen TEXT,
            categoria TEXT DEFAULT 'Pizzas',
            activo INTEGER NOT NULL DEFAULT 1,
            precios TEXT DEFAULT '{}'
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS promociones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            subtitulo TEXT,
            precio REAL DEFAULT 0,
            color TEXT DEFAULT '#d4a017',
            imagen TEXT,
            badge TEXT,
            activo INTEGER NOT NULL DEFAULT 1,
            items TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT (datetime('now','localtime'))
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            cliente_nombre TEXT,
            telefono TEXT,
            direccion TEXT,
            referencias TEXT,
            total REAL DEFAULT 0,
            lat REAL,
            lng REAL,
            status TEXT NOT NULL DEFAULT 'recibido',
            repartidor TEXT,
            negocio_id INTEGER REFERENCES negocios(id),
            telefono_cliente TEXT,
            calificacion INTEGER,
            calificacion_comentario TEXT,
            liquidado INTEGER NOT NULL DEFAULT 0,
            liquidado_at DATETIME,
            liquidado_por TEXT,
            asignado_at DATETIME,
            delivered_at DATETIME,
            created_at DATETIME DEFAULT (datetime('now','localtime'))
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS detalle_pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
            pizza_nombre TEXT,
            cantidad INTEGER DEFAULT 1,
            precio_unitario REAL DEFAULT 0,
            size TEXT,
            crust TEXT
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS extras_pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            detalle_id INTEGER REFERENCES detalle_pedidos(id) ON DELETE CASCADE,
            extra_nombre TEXT,
            precio_extra REAL DEFAULT 0
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT NOT NULL UNIQUE,
            email TEXT,
            password_hash TEXT NOT NULL,
            codigo_verificacion TEXT,
            codigo_expira DATETIME,
            verificado INTEGER NOT NULL DEFAULT 0,
            puntos INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT (datetime('now','localtime'))
        );
    `);

    console.log('Base de datos inicializada OK');
    console.log('Usuarios: capriccio / cocina / caja / reparto  |  Pass: ' + adminPass);
    await db.close();
}

init().catch(err => { console.error('Error:', err); process.exit(1); });
