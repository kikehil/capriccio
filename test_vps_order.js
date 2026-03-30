const fetch = require('node-fetch');

async function testOrder() {
    const pedido = {
        cliente_nombre: "TEST AGENT",
        telefono: "1234567890",
        direccion: "CALLE TEST VPS",
        referencias: "CERCA DE FIX",
        items: [
            { nombre: "Pepperoni", quantity: 1, size: "Grande", totalItemPrice: 195 }
        ],
        lat: 22.2,
        lng: -98.2
    };

    try {
        const res = await fetch('http://localhost:3001/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });
        const data = await res.json();
        console.log('RESULT:', res.status, data);
    } catch (e) {
        console.error('FETCH ERROR:', e.message);
    }
}

testOrder();
