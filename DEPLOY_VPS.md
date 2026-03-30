# 🚀 Guía de Despliegue en VPS - Módulo POS

## 📦 Resumen de Cambios

El módulo POS ha sido **completamente integrado** y enviado a GitHub:
- Commit: `feat: módulo POS completo`
- Rama: `main`
- Repositorio: `https://github.com/kikehil/capriccio.git`

---

## 🔄 PASO 1: Actualizar en el VPS

### Conexión SSH
```bash
ssh root@tu_vps_ip
# O si tienes configurado:
ssh -i /ruta/clave.pem root@tu_vps_ip
```

### Navegar al proyecto
```bash
cd /var/www/capriccio
# O la ruta donde tengas el proyecto
```

### Descargar los cambios
```bash
git pull origin main
```

**Esperado:**
```
✓ Updating 15eb4f6..fc249d5
✓ Fast-forward
✓ X files changed, X insertions(+)
```

---

## ⚙️ PASO 2: Instalar dependencias (SI ES NECESARIO)

Si hay nuevas dependencias (generalmente no, pero por si acaso):

```bash
npm install
```

---

## 🔨 PASO 3: Compilar para producción

```bash
npm run build
```

**Esto toma ~2-3 minutos**

**Esperado:**
```
✓ Compiled successfully
✓ Generating static pages using 3 workers
✓ Finalizing page optimization
```

---

## 🗄️ PASO 4: Migrar base de datos

El módulo POS requiere **3 nuevas tablas**. Hay dos opciones:

### Opción A: Script automático (Recomendado)
```bash
node init-db.js
```

**Esperado:**
```
✓ Base de datos inicializada OK
✓ Usuarios: capriccio / cocina / caja / reparto
```

### Opción B: Migrations SQL manual
Si prefieres ejecutar SQL directamente en PostgreSQL:

```sql
-- Ejecutar en tu BD PostgreSQL
CREATE TABLE IF NOT EXISTS caja_turno (
  id SERIAL PRIMARY KEY,
  cajero_id INTEGER NOT NULL REFERENCES usuarios(id),
  cajero_nombre TEXT NOT NULL,
  negocio_id INTEGER NOT NULL,
  abierto_at TIMESTAMP DEFAULT NOW(),
  cerrado_at TIMESTAMP,
  efectivo_inicial REAL DEFAULT 0,
  efectivo_recibido REAL,
  efectivo_reportado REAL,
  diferencia REAL,
  total_ordenes_caja INTEGER,
  total_efectivo_esperado REAL,
  liquidado INTEGER DEFAULT 0,
  liquidado_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS caja_pagos_detalle (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER NOT NULL REFERENCES caja_turno(id),
  pedido_id INTEGER REFERENCES pedidos(id),
  monto REAL NOT NULL,
  payment_method TEXT NOT NULL,
  cambio_entregado REAL,
  pagado_at TIMESTAMP DEFAULT NOW()
);

-- Agregar campos a tabla pedidos existente:
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS order_origin TEXT DEFAULT 'web';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cajero_id INTEGER;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cajero_nombre TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'efectivo';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_recibido REAL;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_at TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS caja_notes TEXT;
```

---

## 🔄 PASO 5: Reiniciar la aplicación

Si usas **PM2** (recomendado):

```bash
# Verificar que la app esté corriendo
pm2 list

# Reiniciar la app
pm2 restart capriccio
# O el nombre que tengas configurado

# Ver logs
pm2 logs capriccio
```

Si usas **systemd**:

```bash
sudo systemctl restart capriccio
sudo journalctl -u capriccio -f  # Ver logs
```

Si usas **nginx como proxy** (deberías tener configurado):

```bash
# Verificar que nginx está bien
sudo nginx -t

# Reiniciar nginx si cambió config
sudo systemctl restart nginx
```

---

## ✅ PASO 6: Verificar que funciona

### Test 1: Acceder a la página
```bash
curl http://tu_dominio/caja
# O
curl http://tu_vps_ip:3000/caja
```

Debe devolver HTML (inicio de sesión)

### Test 2: Verificar base de datos
```bash
# Si usas SQLite:
sqlite3 database.sqlite ".tables"
# Debe mostrar: caja_turno, caja_pagos_detalle, pedidos, etc.

# Si usas PostgreSQL:
psql -U postgres -d capriccio -c "\dt"
# Debe mostrar las nuevas tablas
```

### Test 3: Login test
```bash
curl -X POST http://tu_dominio/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"caja","password":"CapriccioAdmin2026!","role_request":"caja"}'

# Esperado: Token JWT en respuesta
```

---

## 🔒 PASO 7: Verificar variables de entorno

Asegúrate que en tu VPS esté configurado:

```bash
# SSH a VPS
ssh root@tu_vps_ip

# Verificar .env
cat /var/www/capriccio/.env
```

Debe contener **mínimo**:
```
JWT_SECRET=pizza-capriccio-super-secret-2026
DATABASE_URL=postgresql://user:pass@localhost:5432/capriccio
NODE_ENV=production
PORT=3001
```

Si hace falta algo, edita:
```bash
nano /var/www/capriccio/.env
```

Luego restart:
```bash
pm2 restart capriccio
```

---

## 📊 PASO 8: Verificar Nginx config (si lo usas)

Asegúrate que Nginx proxy apunta correctamente:

```bash
# Ver config
sudo cat /etc/nginx/sites-available/capriccio
# O donde tengas configurado
```

Debe tener algo como:
```nginx
server {
    server_name tu_dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Si necesita cambios:
```bash
sudo nano /etc/nginx/sites-available/capriccio
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎯 ACCESO DESPUÉS DEL DEPLOY

### URLs en VPS
- **POS:** `https://tu_dominio/caja`
- **Admin:** `https://tu_dominio/admin`
- **Cocina:** `https://tu_dominio/cocina`
- **Repartidor:** `https://tu_dominio/repartidor`

### Credenciales
```
Cajero:
  Usuario: caja
  Contraseña: CapriccioAdmin2026!

Admin:
  Usuario: capriccio
  Contraseña: CapriccioAdmin2026!

Cocina:
  Usuario: cocina
  Contraseña: CapriccioAdmin2026!

Repartidor:
  Usuario: reparto
  Contraseña: CapriccioAdmin2026!
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module '@/components/caja/...'"
**Causa:** TypeScript paths no configurado
**Solución:**
```bash
npm run build
```

### Error: "Database table not found"
**Causa:** Migraciones no ejecutadas
**Solución:**
```bash
node init-db.js
pm2 restart capriccio
```

### Error: "CORS error" desde frontend
**Causa:** API_URL incorrecto
**Solución:**
Verifica en `/src/lib/socket.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

En VPS debe ser tu dominio:
```bash
export NEXT_PUBLIC_API_URL=https://tu_dominio
```

Luego rebuild:
```bash
npm run build
pm2 restart capriccio
```

### Socket.io no conecta en vivo
**Causa:** WebSocket bloqueado
**Solución:**
```bash
# Verificar puertos abiertos
sudo ufw status
sudo ufw allow 3001
sudo systemctl restart ufw
```

---

## 📋 CHECKLIST DE DESPLIEGUE

- [ ] `git pull origin main` ejecutado
- [ ] `npm run build` sin errores
- [ ] `node init-db.js` ejecutado
- [ ] PM2/systemd restarted
- [ ] `.env` variables correctas
- [ ] Login de cajero funciona
- [ ] POS accesible en `/caja`
- [ ] Admin tab "POS (Caja)" visible
- [ ] Órdenes aparecen en KDS
- [ ] HTTPS/SSL configurado

---

## 📞 MONITOREO EN VPS

### Ver logs en tiempo real
```bash
pm2 logs capriccio
```

### Ver estado de la app
```bash
pm2 status
```

### Reiniciar si algo falla
```bash
pm2 restart capriccio
```

### Ver uso de recursos
```bash
pm2 monit
```

---

## 🎉 ¡LISTO!

Tu módulo POS está **100% funcional en VPS**.

### Próximos pasos:
1. Prueba con 3-5 pedidos
2. Cierra un turno y verifica contabilidad
3. Descarga reporte CSV desde admin
4. Comparte con tus cajeros para uso

---

## 📚 Documentación adicional

- `GUIA_POS.md` - Manual de usuario
- `PRUEBAS_POS.md` - 10 escenarios de prueba
- `MEMORY.md` - Referencia técnica
- `src/data/caja-types.ts` - Tipos TypeScript

---

**Última actualización:** Marzo 2026
**Versión:** 1.0 Producción
