'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Zap, Bell, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const LaunchLanding = () => {
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0
    });

    // Contador regresivo para el lanzamiento (Ej: 7 días desde hoy)
    useEffect(() => {
        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 7);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            setTimeLeft({
                dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
                horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                segundos: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulación de guardado en el nuevo backend
        try {
            // Aquí llamaríamos a un endpoint de 'leads' o 'prospectos'
            // await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ name, whatsapp }) });
            await new Promise(resolve => setTimeout(resolve, 1500));
            setJoined(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-red-600/30 overflow-hidden relative">
            {/* Background "Food Porn" con Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2000"
                    className="w-full h-full object-cover opacity-20 scale-105"
                    alt="Pizza Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
            </div>

            {/* Elementos Flotantes Decorativos */}
            <div className="absolute top-1/4 left-10 animate-bounce-slow opacity-20 hidden md:block">
                <Flame size={48} className="text-red-600" />
            </div>
            <div className="absolute bottom-1/4 right-10 animate-bounce-slow delay-1000 opacity-20 hidden md:block">
                <Star size={48} className="text-yellow-400" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center min-h-screen justify-center text-center">
                {/* Logo Hype */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center rotate-12 shadow-2xl shadow-red-600/20">
                        <Flame className="text-white fill-white" size={28} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Pizza <span className="text-capriccio-gold">Capriccio</span></h2>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl"
                >
                    <h1 className="text-5xl md:text-8xl font-black italic mb-6 tracking-tighter leading-none uppercase">
                        Algo <span className="text-red-600">ÉPICO</span> se está cocinando... 🍕
                    </h1>

                    {!joined ? (
                        <>
                            <p className="text-xl md:text-3xl mb-12 font-bold text-slate-400 leading-tight italic">
                                La forma más inteligente de pedir pizza llega muy pronto.
                                <span className="block text-yellow-500 font-black mt-4 text-4xl md:text-6xl uppercase tracking-tighter scale-110">
                                    ¡OBTÉN 50% OFF!
                                </span>
                            </p>

                            {/* Contador */}
                            <div className="grid grid-cols-4 gap-4 mb-16 max-w-sm mx-auto">
                                {[
                                    { val: timeLeft.dias, label: 'DÍAS' },
                                    { val: timeLeft.horas, label: 'HRS' },
                                    { val: timeLeft.minutos, label: 'MIN' },
                                    { val: timeLeft.segundos, label: 'SEG' }
                                ].map((t, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-3xl">
                                        <p className="text-2xl font-black italic">{t.val}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Formulario de Captura */}
                            <form onSubmit={handleJoin} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white/5 p-4 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                                <div className="flex-1 space-y-2 text-left">
                                    <input
                                        type="tel"
                                        placeholder="Tu WhatsApp (10 dígitos)"
                                        required
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        className="w-full p-5 bg-slate-900/50 rounded-[2rem] text-white font-black italic outline-none focus:ring-4 ring-red-600/20 border border-white/5 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:scale-100 px-8 py-5 rounded-[2rem] font-black text-xl italic uppercase tracking-tighter transition-all hover:scale-105 shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            ¡QUIERO MI DESCUENTO!
                                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center justify-center gap-4 mt-8">
                                <span className="w-12 h-[1px] bg-slate-800" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    Solo para los primeros 100 registros
                                </p>
                                <span className="w-12 h-[1px] bg-slate-800" />
                            </div>

                            <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40 grayscale">
                                <div className="flex items-center gap-2"><Star size={16} /> <span className="text-xs font-black uppercase">Ingredientes Premium</span></div>
                                <div className="flex items-center gap-2"><Zap size={16} /> <span className="text-xs font-black uppercase">Entrega Flash</span></div>
                                <div className="flex items-center gap-2"><Bell size={16} /> <span className="text-xs font-black uppercase">Smart App</span></div>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-600/10 border-2 border-green-600/50 p-12 rounded-[4rem] backdrop-blur-2xl relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-600/20 blur-3xl rounded-full" />
                            <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
                            <h2 className="text-4xl md:text-6xl font-black mb-4 italic uppercase tracking-tighter">¡ESTÁS EN LA LISTA! 🎉</h2>
                            <p className="text-xl md:text-2xl text-slate-300 font-bold max-w-lg mx-auto leading-relaxed italic">
                                Te avisaremos por WhatsApp en cuanto abramos el sistema para que canjees tu <span className="text-green-500 font-black">50% OFF</span> en tu primer pedido web.
                            </p>

                            <button
                                onClick={() => setJoined(false)}
                                className="mt-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                ¿Registrar otro WhatsApp?
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* Footer de Lanzamiento */}
            <footer className="relative z-10 py-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 text-center">
                    Veracruz, México &copy; 2026 Pizza Capriccio - Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
};

export default LaunchLanding;
