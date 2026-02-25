export interface Promotion {
    id: number;
    titulo: string;
    subtitulo: string;
    precio: number | string;
    color: string;
    imagen: string;
    badge: string;
}

export const promotions: Promotion[] = [
    {
        id: 1,
        titulo: "COMBO CAPRICCIO",
        subtitulo: "2 Pizzas Grandes + Refresco 2L",
        precio: 349,
        color: "from-capriccio-accent to-capriccio-gold",
        imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
        badge: "OFERTA LIMITADA"
    },
    {
        id: 2,
        titulo: "JUEVES DE 2X1",
        subtitulo: "En todas nuestras especialidades clásicas",
        precio: "¡PIDE YA!",
        color: "from-capriccio-dark to-slate-800",
        imagen: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=800",
        badge: "PROMO SEMANAL"
    },
    {
        id: 3,
        titulo: "PACK FAMILIAR",
        subtitulo: "Pizza Familiar + Alitas + Papas",
        precio: 499,
        color: "from-capriccio-dark to-capriccio-gold/20",
        imagen: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?q=80&w=800",
        badge: "MEJOR PRECIO"
    }
];
