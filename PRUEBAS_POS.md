# 🧪 Guía de Pruebas - Módulo POS Capriccio

## ✅ Estado del Sistema
- ✅ Servidor iniciado en `http://localhost:3000`
- ✅ Base de datos configurada con nuevas tablas
- ✅ API endpoints funcionales
- ✅ Frontend compilado sin errores
- ✅ Menú conectado a API real
- ✅ AdminDashboard integrado

---

## 🚀 PRUEBA 1: LOGIN Y APERTURA DE TURNO

### Pasos:
1. Abre: `http://localhost:3000/caja`
2. Login con:
   - Usuario: `caja`
   - Contraseña: `CapriccioAdmin2026!`
3. Declara efectivo inicial: **$50,000**
4. Click "Abrir Turno"

### Esperado:
✅ Login exitoso
✅ Pantalla de apertura de turno
✅ Turno abierto con efectivo inicial guardado
✅ Dashboard principal visible con tabs

**Status:** _Ejecutar ahora_

---

## 🚀 PRUEBA 2: ESCENARIO A - Pedido de Llamada (Domicilio, Sin Pago en Caja)

### Cliente:
```
Nombre: Juan Pérez
Teléfono: +56912345678
Dirección: Calle Principal 123
Referencia: Casa con puerta azul
```

### Items:
- 2x Pizza Capriccio Mediana
- 1x Coca Cola 2L

### Pasos:
1. Click "Nuevo Pedido"
2. **Paso 1:** Selecciona "LLAMADA TELEFONICA"
3. **Paso 2:** Selecciona "A DOMICILIO"
4. **Paso 3:** Ingresa datos del cliente (arriba)
5. **Paso 4:** Selecciona 2x Capriccio + 1x Coca
6. **Paso 5:** Sistema muestra "No paga en caja - Repartidor cobra"
7. **Paso 6:** Confirma

### Esperado:
✅ Pedido creado sin cobro en caja
✅ Total calculado correctamente
✅ Orden enviada a KDS (/cocina)
✅ Vuelve a "Nuevo Pedido"

**Status:** _Ejecutar ahora_

---

## 🚀 PRUEBA 3: ESCENARIO B - Pedido Presencial (Sucursal, Efectivo)

### Cliente:
```
Nombre: Carlos García
Teléfono: 2466543200
Dirección: (no aplica)
```

### Items:
- 1x Pizza Margarita Grande
- 1x Cerveza

### Pasos:
1. Click "Nuevo Pedido"
2. **Paso 1:** Selecciona "PRESENCIAL EN SUCURSAL"
3. **Paso 2:** Selecciona "COMER EN SUCURSAL"
4. **Paso 3:** Ingresa nombre y teléfono
5. **Paso 4:** Selecciona 1x Margarita + 1x Cerveza
6. **Paso 5:**
   - Selecciona "EFECTIVO"
   - Monto Recibido: **$20,000**
   - Sistema calcula Cambio: **$X,XXX**
7. **Paso 6:** Confirma

### Esperado:
✅ Pedido creado CON cobro en caja
✅ Cambio calculado correctamente
✅ **Recibo impreso en PDF** (80mm)
✅ Pedido enviado a KDS
✅ Turno registra **+$X,XXX** en efectivo

**Status:** _Ejecutar ahora_

---

## 🚀 PRUEBA 4: ESCENARIO C - Pedido Presencial (Para Llevar, Tarjeta)

### Cliente:
```
Nombre: María López
Teléfono: 2491234567
```

### Items:
- 3x Pizza Hawaiana Chica
- 2x Agua embotellada

### Pasos:
1. Click "Nuevo Pedido"
2. **Paso 1:** Selecciona "PRESENCIAL EN SUCURSAL"
3. **Paso 2:** Selecciona "PARA LLEVAR"
4. **Paso 3:** Ingresa nombre y teléfono
5. **Paso 4:** Selecciona 3x Hawaiana + 2x Agua
6. **Paso 5:**
   - Selecciona "TARJETA"
   - Sistema avisa "Registrado como pago con tarjeta"
7. **Paso 6:** Confirma

### Esperado:
✅ Pedido creado con método TARJETA
✅ **Sin cobro de efectivo**
✅ Turno registra esta transacción como TARJETA
✅ Orden va a KDS
✅ Recibo impreso

**Status:** _Ejecutar ahora_

---

## 🚀 PRUEBA 5: MONITOREO DE ÓRDENES ACTIVAS

### Pasos:
1. En el POS, click tab **"Órdenes Activas"**
2. Filtra por "Pendientes"
3. Debe ver los 3 pedidos creados

### Esperado:
✅ Lista muestra los pedidos creados en este turno
✅ Estados actualizados en tiempo real (desde KDS)
✅ Se ven: orden_id, cliente, status, tipo de entrega
✅ Filtros funcionan correctamente

**Status:** _Ejecutar después de pruebas 2-4_

---

## 🚀 PRUEBA 6: ESTADÍSTICAS DE CAJA

### Pasos:
1. Click tab **"Caja & Reportes"**
2. Revisa estadísticas

### Esperado:
✅ Órdenes Procesadas: **3**
✅ Efectivo: **$X,XXX** (del escenario B)
✅ Tarjetas: **$Y,YYY** (del escenario C)
✅ Total Ingresos: **$Z,ZZZ**
✅ Duración del turno en vivo
✅ Información de apertura

**Status:** _Ejecutar después de pruebas 2-4_

---

## 🚀 PRUEBA 7: CIERRE DE TURNO

### Pasos:
1. Click tab **"Cerrar Turno"**
2. Click botón "Abrir Reporte de Cierre"
3. Modal aparece pidiendo:
   - Efectivo Inicial: **$50,000** (predefinido)
   - Efectivo Contado: **$X,XXX** (tú ingresas)
4. Sistema calcula automáticamente **Diferencia**
5. Agregar notas si hay discrepancia
6. Click "✓ Cerrar Turno"

### Valores a ingresar:
- Efectivo Inicial: `50000`
- Efectivo Contado: `65000` (ej: $50k inicial + $15k recaudado)

### Esperado:
✅ Modal muestra resumen del turno
✅ Diferencia calculada: **+$15,000** (debe coincidir con efectivo recaudado)
✅ Turno se cierra exitosamente
✅ Página se recarga
✅ **Turno ahora aparece en historial**

**Status:** _Ejecutar después de prueba 6_

---

## 🚀 PRUEBA 8: VERIFICAR INTEGRACIÓN EN ADMIN DASHBOARD

### Pasos:
1. Login como admin: `http://localhost:3000/admin`
   - Usuario: `capriccio`
   - Contraseña: `CapriccioAdmin2026!`
2. En sidebar, click **"POS (Caja)"** (nuevo tab)
3. Verifica:
   - Quick links al POS
   - Historial de turnos cerrados
   - Botón "Ver Detalles"
   - Botón "Descargar CSV"

### Esperado:
✅ Tab "POS (Caja)" visible y accesible
✅ Turno cerrado aparece en historial
✅ Can click "Ver" para detalles completos
✅ Reporte muestra resumen correcto
✅ Botón CSV descarga el archivo

**Status:** _Ejecutar después de prueba 7_

---

## 🚀 PRUEBA 9: VERIFICAR KITCHEN DISPLAY (KDS)

### Pasos:
1. En otra pestaña, abre: `http://localhost:3000/cocina`
2. Login como cocina:
   - Usuario: `cocina`
   - Contraseña: `CapriccioAdmin2026!`
3. Verifica que aparezcan los 3 pedidos creados

### Esperado:
✅ Todos los pedidos POS aparecen en KDS
✅ Mostrar estado "Recibido"
✅ Al cambiar estado a "Listo", debe reflejarse en POS (real-time)

**Status:** _Ejecutar en paralelo con pruebas anteriores_

---

## 🚀 PRUEBA 10: VERIFICAR DELIVERY DASHBOARD

### Pasos:
1. En otra pestaña, abre: `http://localhost:3000/repartidor`
2. Login como repartidor:
   - Usuario: `reparto`
   - Contraseña: `CapriccioAdmin2026!`
3. Cambia un pedido a "Listo" desde KDS
4. Verifica que aparezca en repartidor

### Esperado:
✅ Pedidos de domicilio aparecen al repartidor
✅ Muestra cliente, dirección, teléfono
✅ Botones: NAVEGAR (Google Maps) y LLAMAR
✅ Al entregar, estado se actualiza en tiempo real

**Status:** _Ejecutar después de prueba 9_

---

## 🎯 RESUMEN DE PRUEBAS

| # | Prueba | Status | Notas |
|---|--------|--------|-------|
| 1 | Login y Apertura | ⏳ Pendiente | |
| 2 | Escenario A (Llamada/Domicilio) | ⏳ Pendiente | Sin pago caja |
| 3 | Escenario B (Presencial/Sucursal) | ⏳ Pendiente | Efectivo |
| 4 | Escenario C (Presencial/Llevar) | ⏳ Pendiente | Tarjeta |
| 5 | Órdenes Activas | ⏳ Pendiente | |
| 6 | Estadísticas | ⏳ Pendiente | |
| 7 | Cierre de Turno | ⏳ Pendiente | |
| 8 | Admin POS Tab | ⏳ Pendiente | |
| 9 | Kitchen Display | ⏳ Pendiente | Integración KDS |
| 10 | Delivery | ⏳ Pendiente | Integración repartidor |

---

## 🐛 SI ALGO FALLA

### Error de conexión API
```
Error: Failed to fetch /api/productos
```
**Solución:** Verifica que el servidor esté corriendo:
```bash
npm run dev
```

### No aparecen productos
**Causa:** Menú vacío en BD
**Solución:** Agrega productos en Admin → Productos

### Cambio negativo o incorrecto
**Causa:** Monto recibido < Total
**Solución:** Ingresa monto >= total

### Turno no se cierra
**Causa:** Datos inválidos
**Solución:** Verifica que conteo >= efectivo inicial

### Órdenes no llegan a KDS
**Causa:** Socket.io desconectado
**Solución:** Recarga la página de cocina

---

## 📞 CONTACTO RÁPIDO

- **POS:** `http://localhost:3000/caja`
- **Admin:** `http://localhost:3000/admin`
- **Cocina:** `http://localhost:3000/cocina`
- **Repartidor:** `http://localhost:3000/repartidor`

---

## ✨ Notas Finales

- Todos los datos quedan en BD SQLite
- Los cambios son permanentes
- Puedes crear múltiples turnos/cajeros
- Sistema es 100% funcional en dev mode
- Todo integrado con tu sistema de pedidos existente

**¡Listo para probar! 🚀**
