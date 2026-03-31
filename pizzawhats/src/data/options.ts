export interface ExtraOption {
    id: string;
    nombre: string;
    precio: number;
}

export const extraOptions: ExtraOption[] = [
    { id: 'cheese-crust', nombre: 'Orilla de Queso', precio: 45 },
    { id: 'extra-pepperoni', nombre: 'Extra Pepperoni', precio: 30 },
    { id: 'extra-cheese', nombre: 'Extra Queso', precio: 35 },
    { id: 'dip-garlic', nombre: 'Salsa de Ajo Especial', precio: 15 },
    { id: 'jalapenos', nombre: 'Jalapeños Extra', precio: 10 }
];
