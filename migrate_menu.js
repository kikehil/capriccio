const db = require('./db');

const pizzas = [
    { nombre: "Hawaiana", desc: "Jamón, piña, queso mozzarella", precios: { mini: 50, chica: 65, mediana: 150, grande: 199 } },
    { nombre: "Speciale", desc: "Salchicha, salami, tocino, chorizo y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 167, grande: 209 } },
    { nombre: "Azteca", desc: "Frijol de base, chorizo, jamón, elote, cebolla, tomate, aguacate, jalapeño y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 167, grande: 214 } },
    { nombre: "Fredy's", desc: "Aderezo, tocino, pepperoni, salchicha italiana y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 173, grande: 212 } },
    { nombre: "Pepperoni", desc: "Pepperoni y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 156, grande: 199 } },
    { nombre: "Ranchera", desc: "Frijoles, bistec, jalapeños, tomate, pimiento verde y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 167, grande: 239 } },
    { nombre: "Vegetariana", desc: "Cebolla, champiñón, aceituna, elote, tomate, pimiento, piña, aguacate, queso mozzarella", precios: { mini: 50, chica: 65, mediana: 163, grande: 199 } },
    { nombre: "Mister", desc: "Pepperoni, champiñón y mozzarella", precios: { mini: 50, chica: 65, mediana: 167, grande: 209 } },
    { nombre: "Mar & Tierra", desc: "Camarón, tocino, cebolla, champiñón, pimiento verde y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 195, grande: 249 } },
    { nombre: "Choriqueso", desc: "Doble queso y chorizo", precios: { mini: 50, chica: 65, mediana: 163, grande: 199 } },
    { nombre: "Veneciana", desc: "Jamón, aceituna, champiñón, pimiento verde, chorizo, salchichón y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 173, grande: 212 } },
    { nombre: "Capriccio", desc: "Chipotle, fajita de pollo, piña, fajita de res, elote, pimiento verde y mozzarella", precios: { mini: 50, chica: 65, mediana: 195, grande: 255 } },
    { nombre: "Jumper", desc: "Pimiento, elote, tocino, queso mozzarella", precios: { mini: 50, chica: 65, mediana: 163, grande: 199 } },
    { nombre: "Al Pastor", desc: "Cebolla, piña, jalapeños, carne al pastor y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 173, grande: 212 } },
    { nombre: "Boneless", desc: "Boneless, pepperoni, papas gajo sazonadas y aderezos (ranch y queso amarillo)", precios: { mini: 50, chica: 65, mediana: 195, grande: 255 } },
    { nombre: "Napoli", desc: "Jamón, salchicha italiana, tocino, champiñón, pimiento verde, queso mozzarella", precios: { mini: 50, chica: 65, mediana: 167, grande: 209 } },
    { nombre: "Chicken Tenders", desc: "Cebolla, jalapeños, tomate, fajita de pollo y queso mozzarella", precios: { mini: 50, chica: 65, mediana: 173, grande: 212 } },
    { nombre: "Jumbo", desc: "Combínala como mas te guste, de 1 a 4 especialidades", precios: { jumbo: 315 } }
];

async function run() {
    try {
        await db.query(`DELETE FROM productos`);
        
        for (let p of pizzas) {
            const basePrice = p.precios.mini || p.precios.jumbo;
            await db.query(
                `INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, activo, precios) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [p.nombre, p.desc, basePrice, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800', '🍕 Pizzas', 1, JSON.stringify(p.precios)]
            );
        }
        console.log("Menú actualizado! con SQLITE");
        process.exit(0);
    } catch(e) { console.error(e); process.exit(1); }
}
run();
