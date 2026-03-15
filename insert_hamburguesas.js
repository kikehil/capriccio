const db = require('./db');

const hamburguesas = [
    { nombre: "Sencilla", desc: "Hamburguesa sencilla", precio: 78 },
    { nombre: "Burger", desc: "Hamburguesa clásica", precio: 90 },
    { nombre: "Mega burger", desc: "Hamburguesa grande", precio: 115 },
    { nombre: "Arrachera", desc: "Hamburguesa de arrachera", precio: 120 },
    { nombre: "De boneless", desc: "Hamburguesa con boneless", precio: 120 }
];

async function run() {
    try {
        // Opcional: eliminar hamburguesas anteriores si las hubiera (solo si quieres limpiar)
        // await db.query(`DELETE FROM productos WHERE categoria = '🍔 Hamburguesas'`);
        
        for (let p of hamburguesas) {
            await db.query(
                `INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, activo) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    p.nombre, 
                    p.desc, 
                    p.precio, 
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800', 
                    '🍔 Hamburguesas', 
                    1
                ]
            );
        }
        console.log("Hamburguesas insertadas exitosamente.");
        process.exit(0);
    } catch(e) { 
        console.error(e); 
        process.exit(1); 
    }
}
run();
