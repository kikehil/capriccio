'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '@/data/cart';

interface FloatingCartProps {
    cart: CartItem[];
    onOrder?: (items: CartItem[]) => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ cart, onOrder }) => {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.totalItemPrice * item.quantity), 0);

    const handleOrder = () => {
        if (onOrder) {
            onOrder(cart);
            return;
        }
        // Fallback to WhatsApp if no handler provided
        sendToWhatsApp();
    };

    const sendToWhatsApp = () => {
        const phone = "5212221234567"; // Default for demo, user should replace
        let message = "🍕 *NUEVO PEDIDO - PIZZA CAPRICCIO*%0A%0A";

        cart.forEach(item => {
            message += `✅ *${item.quantity}x ${item.nombre.toUpperCase()}* ($${item.totalItemPrice})%0A`;
            if (item.extras.length > 0) {
                item.extras.forEach(ex => {
                    message += `   └─ ➕ _${ex.nombre}_%0A`;
                });
            }
            message += `%0A`;
        });

        message += `💰 *TOTAL A PAGAR: $${totalPrice}*%0A%0A---%0A_Pedido generado desde la Web de Pizza Capriccio_`;

        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0, x: "-50%" }}
                    animate={{ y: 0, opacity: 1, x: "-50%" }}
                    exit={{ y: 100, opacity: 0, x: "-50%" }}
                    className="fixed bottom-6 left-1/2 w-[92%] max-w-lg z-[90]"
                >
                    <div className="bg-capriccio-dark text-white rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-4 pl-6 md:pl-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="relative flex-shrink-0">
                                <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-capriccio-gold" />
                                <span className="absolute -top-1.5 -right-1.5 bg-capriccio-accent text-white text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-capriccio-dark">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] md:text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em] md:tracking-[0.2em]">Tu Pedido</span>
                                <span className="text-xl md:text-2xl font-black text-white italic leading-none">
                                    ${totalPrice}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleOrder}
                            className="bg-capriccio-gold hover:bg-capriccio-gold/90 text-capriccio-dark px-3 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] font-black italic flex items-center gap-2 md:gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg group flex-shrink-0"
                        >
                            <span className="text-xs md:text-base tracking-tighter">CONFIRMAR <span className="hidden sm:inline">PEDIDO</span></span>
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingCart;
