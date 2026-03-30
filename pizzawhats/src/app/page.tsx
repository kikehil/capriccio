'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pizzas as initialPizzas, Pizza } from '@/data/menu';
import { ExtraOption } from '@/data/options';
import { CartItem } from '@/data/cart';
import PizzaCard from '@/components/pizza/PizzaCard';
import FloatingCart from '@/components/cart/FloatingCart';
import CustomizationModal from '@/components/pizza/CustomizationModal';
import CheckoutModal from '@/components/cart/CheckoutModal';
import PromoSlider from '@/components/layout/PromoSlider';
import NotificationToast, { NotificationType } from '@/components/ui/NotificationToast';
import { Pizza as PizzaIcon, Phone, MapPin, Clock } from 'lucide-react';
import { getSocket, API_URL } from '@/lib/socket';
import BrandHeader from '@/components/layout/BrandHeader';


export default function Home() {
  const [menu, setMenu] = useState<Pizza[]>(initialPizzas);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: NotificationType;
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ isVisible: true, message, type });
  };

  const handleOpenModal = (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setIsModalOpen(true);
  };

  const addToCart = (pizza: Pizza, extras: ExtraOption[], finalPrice: number) => {
    const extraIds = extras.map(e => e.id).sort().join('-');
    const cartId = `${pizza.id}-${extraIds}`;

    const existing = cart.find(item => item.cartId === cartId);
    if (existing) {
      setCart(cart.map(item =>
        item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        ...pizza,
        extras,
        totalItemPrice: finalPrice,
        quantity: 1,
        cartId
      }]);
    }
    setIsModalOpen(false);
  };

  // No socket logic for basic version
  const sendToOrderChannel = (userData: any) => {
    const totalPrice = cart.reduce((acc, item) => acc + (item.totalItemPrice * item.quantity), 0);

    // Formatear el detalle del pedido
    const itemsText = cart.map(item => {
      const extrasText = item.extras && item.extras.length > 0
        ? ` (+ ${item.extras.map((e: any) => e.nombre).join(', ')})`
        : '';
      return `• ${item.quantity}x ${item.nombre}${extrasText}`;
    }).join('\n');

    const message = `🍕 *NUEVO PEDIDO - CAPRICCIO PIZZA*\n\n` +
      `👤 *Cliente:* ${userData.nombre}\n` +
      `📞 *Teléfono:* ${userData.telefono}\n` +
      `📍 *Dirección:* ${userData.direccion}\n` +
      (userData.referencias ? `🗒️ *Referencias:* ${userData.referencias}\n` : '') +
      `--------------------------\n` +
      `🛍️ *PEDIDO:*\n${itemsText}\n` +
      `--------------------------\n` +
      `💰 *TOTAL A PAGAR:* $${totalPrice}\n\n` +
      `¡Gracias por su preferencia! ✨`;

    const encodedMessage = encodeURIComponent(message);
    // Cambia el número aquí por el de la pizzería
    const WHATSAPP_NUMBER = "521000000000";
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Limpiar carrito y cerrar
    setCart([]);
    setIsCheckoutOpen(false);
    showNotification("¡Redirigiendo a WhatsApp!", 'success');
  };

  return (
    <div className="bg-[#fafafa] min-h-screen selection:bg-yellow-200">
      <BrandHeader />
      {/* Dynamic Header / Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />
          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Wood Fired Oven"
          />
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center pt-40 pb-20 flex flex-col items-center justify-center min-h-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center flex-grow justify-center"
          >
            <div className="flex justify-center mb-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-capriccio-gold/10 blur-[100px] rounded-full" />
                <img
                  src="/img/capriccio-logo.svg"
                  alt="Capriccio Logo"
                  className="relative w-72 md:w-[32rem] h-auto object-contain drop-shadow-[0_20px_50px_rgba(234,179,8,0.3)]"
                />
              </motion.div>
            </div>
            <p className="text-lg md:text-2xl text-gray-200 font-medium italic mb-6 tracking-wide max-w-2xl mx-auto px-4 drop-shadow-lg">
              Sabor tradicional al horno de leña en el corazón de Pánuco. Ingredientes premium, pasión artesanal.
            </p>
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-capriccio-gold hover:bg-capriccio-gold/90 text-capriccio-dark px-10 py-5 md:px-12 md:py-6 rounded-[2rem] font-brand font-black text-lg md:text-xl italic uppercase tracking-widest shadow-2xl transition-all inline-block mb-4"
            >
              ORDENAR AHORA
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-6 md:gap-12 pb-8"
          >
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="w-5 h-5 text-capriccio-gold" />
              <span className="text-sm font-bold uppercase tracking-widest">30 MIN</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <MapPin className="w-5 h-5 text-capriccio-gold" />
              <span className="text-sm font-bold uppercase tracking-widest">A DOMICILIO</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Promotions Slider */}
      <PromoSlider />

      {/* Menu Section */}
      <main id="menu" className="container mx-auto px-6 py-20 pb-40">
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Nuestro <span className="text-capriccio-gold">Menú</span>
          </h2>
          <div className="w-24 h-2 bg-capriccio-gold rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {menu.map(pizza => (
            <PizzaCard
              key={pizza.id}
              pizza={pizza}
              onAddToCart={() => handleOpenModal(pizza)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <img src="/img/capriccio-logo.svg" alt="Capriccio Logo" className="h-16 w-auto mb-6 drop-shadow-xl" />
            <p className="text-gray-500 font-medium">Las mejores pizzas de la ciudad, elaboradas con ingredientes frescos y el amor que solo nosotros sabemos ponerle.</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Horarios</h4>
            <div className="space-y-2">
              <p className="font-bold flex justify-between"><span>Lun - Jue:</span> <span className="text-gray-500">12:00 PM - 10:00 PM</span></p>
              <p className="font-bold flex justify-between"><span>Vie - Dom:</span> <span className="text-gray-500">12:00 PM - 12:00 AM</span></p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Ubicación</h4>
            <p className="font-bold text-gray-700 uppercase italic">Pánuco, Veracruz, México</p>
            <p className="text-gray-400 text-[10px] font-bold mt-1">Sabor artesanal directo a tu puerta.</p>
            <p className="text-capriccio-accent font-bold mt-2 underline decoration-2 underline-offset-4 cursor-pointer hover:text-capriccio-gold transition-colors">Ver en Mapa</p>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-20 pt-8 border-t border-gray-50 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Pizza Capriccio. Todos los derechos reservados.
        </div>
      </footer>

      {/* Overlays */}
      <CustomizationModal
        pizza={selectedPizza}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={addToCart}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={sendToOrderChannel}
        total={cart.reduce((acc, item) => acc + (item.totalItemPrice * item.quantity), 0)}
      />
      <FloatingCart cart={cart} onOrder={() => setIsCheckoutOpen(true)} />

      {/* Notifications */}
      <NotificationToast
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
};
