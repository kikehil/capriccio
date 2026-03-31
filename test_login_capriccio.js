const fetch = require('node-fetch');

async function testLogin() {
    try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'capriccio',
                password: 'Capriccio2026!',
                role_request: 'admin'
            })
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Error connecting to server:", err);
    }
}

testLogin();
