const db = require('./db');

const nuevosProductos = [
    { nombre: "Burritos rellenos", desc: "Orden de 3 piezas", precio: 89, categoria: "🌮 ANTOJITOS" },
    { nombre: "Papas", desc: "Orden de papas fritas", precio: 48, categoria: "🍟 complementos" },
    { nombre: "Boneless", desc: "Orden de boneless", precio: 120, categoria: "🍟 complementos" }
];

async function run() {
    try {
        for (let p of nuevosProductos) {
            await db.query(
                `INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, activo) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    p.nombre, 
                    p.desc, 
                    p.precio, 
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800', 
                    p.categoria, 
                    1
                ]
            );
        }
        console.log("Nuevos productos insertados exitosamente.");
        process.exit(0);
    } catch(e) { 
        console.error(e); 
        process.exit(1); 
    }
}
run();
