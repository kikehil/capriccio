# 🚀 Guía de Inicio - POS Capriccio

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Base de datos SQLite (`database.sqlite`)

## Instalación

```bash
npm install
```

## Inicializar Base de Datos (Primera vez)

```bash
node init-db.js
```

Esto crea las tablas necesarias y los usuarios por defecto:
- **Admin**: usuario `capriccio` contraseña `CapriccioAdmin2026!`
- **Caja**: usuario `caja` contraseña `CapriccioAdmin2026!`
- **Cocina**: usuario `cocina` contraseña `CapriccioAdmin2026!`
- **Reparto**: usuario `reparto` contraseña `CapriccioAdmin2026!`

## Ejecutar en Desarrollo

⚠️ **IMPORTANTE**: Debes ejecutar DOS servidores en PARALELO:

### Terminal 1: Backend (Express) - Puerto 3001
```bash
npm run server
```

Deberías ver:
```
🚀 SERVIDOR EN PUERTO 3001
✅ Conectado a SQLite Local (database.sqlite)
```

### Terminal 2: Frontend (Next.js) - Puerto 3000
```bash
npm run dev
```

Deberías ver:
```
▲ Next.js 16.1.6
- Ready in 1234ms
- Local: http://localhost:3000
```

## Acceder a las Aplicaciones

Una vez que AMBOS servidores estén corriendo:

### 🛵 POS (Punto de Venta)
- **URL**: http://localhost:3000/caja
- **Usuario**: `caja`
- **Contraseña**: `CapriccioAdmin2026!`

### 👨‍💼 Admin Dashboard
- **URL**: http://localhost:3000/admin
- **Usuario**: `capriccio`
- **Contraseña**: `CapriccioAdmin2026!`

### 👨‍🍳 Kitchen Display (Cocina)
- **URL**: http://localhost:3000/cocina
- **Usuario**: `cocina`
- **Contraseña**: `CapriccioAdmin2026!`

### 🚚 Delivery (Repartidor)
- **URL**: http://localhost:3000/repartidor
- **Usuario**: `reparto`
- **Contraseña**: `CapriccioAdmin2026!`

## Troubleshooting

### ❌ "Usuario o contraseña incorrectos"
- Verifica que `npm run server` esté ejecutándose en Terminal 1
- El Express backend en puerto 3001 es necesario

### ❌ "Cannot GET /api/..."
- Falta arrancar el backend (Terminal 1)
- Verifica que ambos servidores estén corriendo

### ❌ "Error: Port 3000 already in use"
```bash
# Busca el proceso en puerto 3000 y termínalo, o usa otro puerto:
npm run dev -- -p 3002
```

### ❌ "Error: Port 3001 already in use"
```bash
# Busca el proceso en puerto 3001 y termínalo, o edita .env:
# PORT=3002 (y actualiza socket.ts)
```

## Comandos Útiles

```bash
# Build para producción
npm run build

# Iniciar en producción (requiere build antes)
npm start

# Linting
npm run lint

# Resetear base de datos
rm database.sqlite
node init-db.js
```

## Flujo Típico

1. ✅ `npm install` (solo primera vez)
2. ✅ `node init-db.js` (si necesitas resetear datos)
3. ✅ Abre 2 terminales
4. ✅ Terminal 1: `npm run server` (espera a ver "SERVIDOR EN PUERTO 3001")
5. ✅ Terminal 2: `npm run dev` (espera a ver "Ready in XXXms")
6. ✅ Abre http://localhost:3000/caja en el navegador
7. ✅ Usa las credenciales por defecto

---

**¡Listo! Ahora puedes probar el POS.** 🍕
