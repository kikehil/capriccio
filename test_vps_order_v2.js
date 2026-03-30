const http = require('http');

const data = JSON.stringify({
    cliente_nombre: "TEST AGENT 2",
    telefono: "1234567890",
    direccion: "CALLE TEST VPS",
    referencias: "CERCA DE FIX",
    items: [
        { nombre: "Pepperoni", quantity: 1, size: "Grande", totalItemPrice: 195 }
    ],
    lat: 22.2,
    lng: -98.2
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/pedidos',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', responseBody);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.write(data);
req.end();
