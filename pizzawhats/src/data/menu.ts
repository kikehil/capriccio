export interface Pizza {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria: string;
    activo: boolean; // Control de disponibilidad
}

export const pizzas: Pizza[] = [
    {
        id: 1,
        nombre: "Pepperoni Capriccio",
        descripcion: "Doble porción de pepperoni premium sobre una base de mozarella artesanal y un toque de orégano fresco.",
        precio: 189,
        imagen: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
        categoria: "Clásicas",
        activo: true
    },
    {
        id: 2,
        nombre: "Mexicana de la Huasteca",
        descripcion: "Chorizo artesanal, jalapeño fresco, cebolla morada y frijoles refritos sobre masa crujiente.",
        precio: 210,
        imagen: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=800",
        categoria: "Especialidades",
        activo: true
    },
    {
        id: 3,
        nombre: "Hawaiana al Horno",
        descripcion: "Jamón glaseado en su jugo, piña miel rostizada y extra queso mozzarella fundido.",
        precio: 195,
        imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
        categoria: "Clásicas",
        activo: true
    },
    {
        id: 4,
        nombre: "Gran Capriccio de Carnes",
        descripcion: "Salami italiano, jamón ahumado, salchicha artesanal y tocino premium crujiente.",
        precio: 230,
        imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
        categoria: "Especialidades",
        activo: true
    },
    {
        id: 5,
        nombre: "Huerto Gourmet",
        descripcion: "Pimiento verde, cebolla morada, champiñones frescos y aceitunas negras del Mediterráneo.",
        precio: 185,
        imagen: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?q=80&w=800",
        categoria: "Clásicas",
        activo: true
    },
    {
        id: 6,
        nombre: "Pollo BBQ al Leño",
        descripcion: "Pechuga de pollo a la parrilla y nuestra salsa BBQ artesanal con receta de la casa.",
        precio: 215,
        imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
        categoria: "Especialidades",
        activo: true
    },
    {
        id: 7,
        nombre: "Alitas Capriccio (6 pzas)",
        descripcion: "Alitas bañadas en salsa artesanal a elegir, acompañadas de aderezo ranch.",
        precio: 120,
        imagen: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800",
        categoria: "Especialidades",
        activo: true
    },
    {
        id: 8,
        nombre: "Refresco Familiar 2L",
        descripcion: "Bien frío para compartir la experiencia Capriccio.",
        precio: 45,
        imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800",
        categoria: "Bebidas",
        activo: true
    },
    {
        id: 9,
        nombre: "Agua Mineral Natural",
        descripcion: "Frescura pura para acompañar tu pizza artesanal.",
        precio: 25,
        imagen: "https://images.unsplash.com/photo-1556767667-0754773d55d8?q=80&w=800",
        categoria: "Bebidas",
        activo: true
    }
];
