'use client';

import React, { useState } from 'react';
import { Flame, Lock, User, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
    onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ user: '', pass: '' });
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 800));

        if (credentials.user === 'admin' && credentials.pass === 'pizza2026') {
            onLogin(true);
        } else {
            setError(true);
            setLoading(false);
            setTimeout(() => setError(false), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 border border-white/10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center rotate-12 shadow-xl shadow-red-600/20 mx-auto mb-6">
                        <Flame className="text-white fill-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">PIZZA CAPRICCIO</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Panel de Control de Alto Nivel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-capriccio-gold/20 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                placeholder="Usuario"
                                onChange={(e) => setCredentials({ ...credentials, user: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave de Acceso</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-capriccio-gold/20 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                placeholder="••••••••"
                                onChange={(e) => setCredentials({ ...credentials, pass: e.target.value })}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100"
                            >
                                <ShieldAlert size={18} />
                                <p className="text-xs font-black uppercase tracking-tight">Acceso denegado. Credenciales inválidas.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-capriccio-dark text-white rounded-[1.5rem] font-black text-lg italic uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                ENTRAR AL SISTEMA
                                <Lock size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        Sistema Encriptado &copy; 2026 Pizza Capriccio S.A.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
