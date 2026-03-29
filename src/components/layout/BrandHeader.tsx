'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, LogIn, LogOut, Star, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomerAuthModal from '@/components/customer/CustomerAuthModal';
import MisPedidosModal from '@/components/customer/MisPedidosModal';

interface ClienteSession {
    nombre: string;
    telefono: string;
    puntos: number;
    token: string;
}

const BrandHeader = () => {
    const [showAuth, setShowAuth] = useState(false);
    const [showPedidos, setShowPedidos] = useState(false);
    const [cliente, setCliente] = useState<ClienteSession | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('capriccio_cliente_token');
        const nombre = localStorage.getItem('capriccio_cliente_nombre');
        const telefono = localStorage.getItem('capriccio_cliente_telefono');
        const puntos = parseInt(localStorage.getItem('capriccio_cliente_puntos') || '0');
        if (token && nombre && telefono) {
            setCliente({ token, nombre, telefono, puntos });
        }
    }, []);

    const handleAuthSuccess = (data: ClienteSession) => {
        localStorage.setItem('capriccio_cliente_token', data.token);
        localStorage.setItem('capriccio_cliente_nombre', data.nombre);
        localStorage.setItem('capriccio_cliente_telefono', data.telefono);
        localStorage.setItem('capriccio_cliente_puntos', String(data.puntos || 0));
        setCliente(data);
        setShowAuth(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('capriccio_cliente_token');
        localStorage.removeItem('capriccio_cliente_nombre');
        localStorage.removeItem('capriccio_cliente_telefono');
        localStorage.removeItem('capriccio_cliente_puntos');
        setCliente(null);
        setShowMenu(false);
    };

    return (
        <>
            <header className="bg-capriccio-dark/95 backdrop-blur-md p-4 sticky top-0 z-[100] border-b border-capriccio-gold/20 shadow-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

                    {/* LOGO */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-4 group cursor-pointer shrink-0"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img
                            src="/logohd.png"
                            alt="Capriccio Logo"
                            className="relative h-16 w-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                        />
                    </motion.div>

                    {/* NAVIGATION - DESKTOP */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {['Menú', 'Promos', 'Nosotros', 'Contacto'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-white/70 hover:text-capriccio-gold font-brand font-bold text-xs uppercase tracking-widest transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-capriccio-gold transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </nav>

                    {/* DERECHA: ubicación + login */}
                    <div className="flex items-center gap-3">

                        {/* Sucursal */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="hidden sm:flex flex-col items-end"
                        >
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm group hover:border-capriccio-gold/30 transition-all">
                                <MapPin className="text-capriccio-gold w-4 h-4 group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-xs leading-none">Pánuco</span>
                                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Veracruz</span>
                                </div>
                            </div>
                            <div className="mt-1 mr-2 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-green-500 text-[9px] font-black uppercase tracking-wider">Abierto Ahora</span>
                            </div>
                        </motion.div>

                        {/* Botón Login / Perfil */}
                        {!cliente ? (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setShowAuth(true)}
                                className="flex items-center gap-2 bg-capriccio-gold text-[#0f172a] px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#e5b020] transition-all shadow-lg shadow-capriccio-gold/20 active:scale-95 whitespace-nowrap"
                            >
                                <LogIn size={15} />
                                <span className="hidden sm:inline">Iniciar Sesión</span>
                                <span className="sm:hidden">Entrar</span>
                            </motion.button>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(v => !v)}
                                    className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-2 rounded-2xl transition-all"
                                >
                                    <div className="w-8 h-8 bg-capriccio-gold rounded-xl flex items-center justify-center text-[#0f172a] font-black text-sm">
                                        {cliente.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-white font-black text-xs leading-none">{cliente.nombre.split(' ')[0]}</span>
                                        <span className="text-capriccio-gold text-[9px] font-black flex items-center gap-1">
                                            <Star size={8} fill="currentColor" /> {cliente.puntos} pts
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                {showMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20">
                                            <div className="p-4 bg-[#0f172a]">
                                                <p className="text-white font-black text-sm">{cliente.nombre}</p>
                                                <p className="text-white/50 text-xs font-bold">{cliente.telefono}</p>
                                                <div className="mt-2 flex items-center gap-1.5 bg-capriccio-gold/20 px-3 py-1.5 rounded-xl w-fit">
                                                    <Star size={12} className="text-capriccio-gold" fill="currentColor" />
                                                    <span className="text-capriccio-gold font-black text-xs">{cliente.puntos} puntos</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setShowPedidos(true); setShowMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-colors border-b border-slate-100"
                                            >
                                                <Package size={15} className="text-[#d4a017]" />
                                                Mis Pedidos
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-wider transition-colors"
                                            >
                                                <LogOut size={15} />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <CustomerAuthModal
                open={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={handleAuthSuccess}
            />

            {cliente && (
                <MisPedidosModal
                    open={showPedidos}
                    onClose={() => setShowPedidos(false)}
                    token={cliente.token}
                    telefono={cliente.telefono}
                />
            )}
        </>
    );
};

export default BrandHeader;
