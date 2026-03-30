# 🍕 Guía de Uso - Módulo POS Capriccio

## Acceso Rápido

**URL**: `http://localhost:3000/caja`

**Credenciales Demo:**
- Usuario: `caja`
- Contraseña: `CapriccioAdmin2026!`

---

## Flujo de Uso

### **1. Iniciar Sesión**
```
1. Ingresa usuario y contraseña
2. Opcionalmente: declara efectivo inicial ($50,000 vuelto, etc.)
3. Sistema abre automáticamente el turno
```

### **2. Crear Nuevo Pedido**
El formulario te guía a través de 5 pasos:

#### **Paso 1: Origen del Pedido**
- **Llamada Telefónica** - Cliente llamó
- **Presencial en Sucursal** - Cliente está en el local

#### **Paso 2: Método de Entrega**
- **Comer en Sucursal** - Cliente consume acá
- **Para Llevar** - Cliente retira en el local
- **A Domicilio** - Se envía a la dirección

#### **Paso 3: Datos del Cliente**
- Nombre *
- Teléfono *
- Dirección (solo si es domicilio) *
- Referencias (ej: "casa blanca, timbre azul")

#### **Paso 4: Seleccionar Items**
- Busca por categoría (Pizzas, Bebidas, etc.)
- Haz click en el producto para agregar
- Usa + y - para ajustar cantidades
- Revisa el total en el carrito a la derecha

#### **Paso 5: Pago**
**Si es para COMER EN SUCURSAL o PARA LLEVAR:**
- Selecciona método: Efectivo o Tarjeta
- Si es **Efectivo**: ingresa monto recibido (calcula cambio automático)
- Si es **Tarjeta**: marca que se procesará el pago

**Si es DOMICILIO (pago repartidor):**
- El sistema te avisa que se cobrará al momento de la entrega
- No es necesario cobrar en caja ahora

#### **Paso 6: Confirmación**
- Revisa todos los datos
- Confirma y envía a cocina
- **Se imprime automáticamente el recibo** (si es presencial)
- Regresa a "Nuevo Pedido" automáticamente

---

## Gestión de Turno

### **Ver Órdenes Activas**
- Tab: "Órdenes Activas"
- Filtra por: Todas / Pendientes / Listas
- Monitorea en tiempo real desde cocina

### **Estadísticas de Caja**
- Tab: "Caja & Reportes"
- Visualiza:
  - Órdenes procesadas
  - Total efectivo recaudado
  - Total tarjetas
  - Total de ingresos

### **Cerrar Turno**
- Tab: "Cerrar Turno"
- Abre el modal de "Reporte de Cierre de Turno"
- Ingresa: Efectivo contado
- El sistema calcula la diferencia automáticamente
- Confirma para finalizar

---

## Características Especiales

### **Cálculo Automático de Cambio**
```
Total: $10,000
Monto Recibido: $15,000
Cambio: $5,000 ✓
```

### **Impresión de Recibos**
- Formato térmico 80mm
- Se imprime automáticamente para pedidos en sucursal/llevar
- Descarga en PDF si no hay impresora física

### **Integración con Cocina (KDS)**
- Cada pedido creado en POS se envía automáticamente a cocina
- Kitchen Display System recibe notificación en tiempo real
- El repartidor solo ve órdenes "listas" después de cocina

### **Auditoría Completa**
Cada pago queda registrado con:
- Cajero que lo procesó
- Método de pago
- Monto exacto
- Timestamp
- Cambio entregado

---

## Casos de Uso Prácticos

### **Caso 1: Cliente llama pidiendo 2 Capriccio a domicilio**
```
1. Origen: LLAMADA TELEFONICA
2. Entrega: A DOMICILIO
3. Cliente: Juan Pérez, +56912345678
   Dirección: Calle Principal 123
   Referencias: Casa blanca, puerta azul
4. Items: 2x Pizza Capriccio Mediana
5. Pago: NO PAGA EN CAJA (repartidor cobra)
6. Confirma → Pedido a cocina
```

### **Caso 2: Cliente presencial quiere comer acá**
```
1. Origen: PRESENCIAL EN SUCURSAL
2. Entrega: COMER EN SUCURSAL
3. Cliente: Carlos (solo nombre)
4. Items: 1x Pizza Grande Margarita, 1x Coca 2L
5. Pago: EFECTIVO
   Monto Recibido: $15,000
   Cambio: $5,000 ✓
6. Confirma → Imprime recibo, va a cocina
```

### **Caso 3: Cliente para llevar paga con tarjeta**
```
1. Origen: PRESENCIAL EN SUCURSAL
2. Entrega: PARA LLEVAR
3. Cliente: María González
4. Items: 3x Pizza Chica
5. Pago: TARJETA
6. Confirma → Cliente paga con máquina, retira en cocina
```

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Monto insuficiente" | El efectivo entregado < total | Pide al cliente más dinero |
| "Debes agregar al menos un ítem" | Carrito vacío | Agrega items del menú |
| "El nombre es requerido" | Campo obligatorio vacío | Completa todos los campos marcados con * |
| "Dirección requerida para domicilio" | Falta dirección en domicilio | Pide la dirección al cliente |

---

## Cierre de Turno - Paso a Paso

### **1. Ve a Tab "Cerrar Turno"**

### **2. Cuenta TODO el efectivo en la caja**
- Billetes
- Monedas
- Recibos de pagos con tarjeta (aparte)

### **3. Ingresa el total contado**
```
Efectivo Inicial: $50,000
Dinero Contado: $72,500
[Sistema calcula]
Diferencia: +$22,500 ✓ (O negativa si falta dinero)
```

### **4. Agrega notas si hay diferencia**
```
"Cambio redondeado en 2 transacciones"
"Falta billete de $1,000 (verificar con cliente)"
```

### **5. Haz click en "Cerrar Turno"**
- Sistema registra todo
- Turno se cierra
- Página se recarga

---

## Roles y Permisos

| Rol | Puede Hacer |
|-----|------------|
| **caja** | Crear ordenes, abrir/cerrar turno propio |
| **admin** | Todo: crear órdenes, cerrar turnos de otros, ver reportes |
| **responsable** | Cerrar turnos de otros, supervisión |

---

## Reportes Disponibles

### **Durante el Turno**
- Órdenes por estado
- Total de ingresos en tiempo real
- Desglose efectivo vs tarjeta

### **Al Cerrar Turno**
- Efectivo inicial vs final
- Diferencia (+ o -)
- Órdenes procesadas
- Ingresos por canal (web/llamada/presencial)

---

## Integración con Otros Módulos

### **Kitchen Display (KDS)**
- Las órdenes creadas en POS aparecen automáticamente en `/cocina`
- Status: "Recibido" → "Preparando" → "Listo"

### **Dashboard de Repartidor**
- Solo ve órdenes "Listos" de domicilio
- Recibe notificación cuando están listos

### **Admin Dashboard**
- Tab "Caja" muestra historial de turnos cerrados
- Reportes de caja por fecha/cajero
- Liquidación de dinero

---

## Consejos de Operación

✅ **Mejores Prácticas:**
- Abre turno al inicio del día
- Cierra turno después de cada cambio de cajero
- Cuenta el efectivo en un lugar seguro
- Anota diferencias en las notas
- Imprime recibos para auditoría

❌ **Evita:**
- Cerrar turno sin contar efectivo
- Dejar ordenes sin procesar en POS
- Cambiar cajero sin cerrar turno
- Perder recibos impresos

---

## Soporte y Contacto

**Si hay un problema:**
1. Verifica el error mostrado en pantalla
2. Recarga la página (F5)
3. Intenta de nuevo
4. Si persiste, contacta al admin

**Logs de auditoría:**
Todos los pagos quedan registrados en `caja_pagos_detalle` para auditoría

---

**Última actualización:** Marzo 2026
**Versión del Sistema:** 1.0
