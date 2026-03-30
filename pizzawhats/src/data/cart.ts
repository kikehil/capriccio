import { Pizza } from "@/data/menu";
import { ExtraOption } from "@/data/options";

export interface CartItem extends Pizza {
    extras: ExtraOption[];
    totalItemPrice: number;
    quantity: number;
    cartId: string; // To distinguish between same pizza with different extras
}
