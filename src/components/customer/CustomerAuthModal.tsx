'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, User, Mail, CheckCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/socket';

type Step = 'login' | 'register' | 'verify';

interface CustomerAuthModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (data: { nombre: string; telefono: string; puntos: number; token: string }) => void;
    initialStep?: Step;
}

export default function CustomerAuthModal({ open, onClose, onSuccess, initialStep = 'login' }: CustomerAuthModalProps) {
    const [step, setStep] = useState<Step>(initialStep);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Login
    const [loginTel, setLoginTel] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Registro
    const [regNombre, setRegNombre] = useState('');
    const [regTel, setRegTel] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regPass2, setRegPass2] = useState('');

    // Verificación 2FA — 6 celdas individuales
    const [verifyTel, setVerifyTel] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!open) {
            setStep(initialStep);
            setError('');
            setSuccessMsg('');
            setCode(['', '', '', '', '', '']);
            setLoginTel(''); setLoginPass('');
            setRegNombre(''); setRegTel(''); setRegEmail(''); setRegPass(''); setRegPass2('');
        }
    }, [open, initialStep]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleCodeChange = (val: string, idx: number) => {
        const clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
        const next = [...code];
        next[idx] = clean;
        setCode(next);
        if (clean && idx < 5) codeRefs.current[idx + 1]?.focus();
        if (!clean && idx > 0) codeRefs.current[idx - 1]?.focus();
    };

    const handleCodeKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Backspace' && !code[idx] && idx > 0) {
            codeRefs.current[idx - 1]?.focus();
        }
    };

    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
        const next = [...code];
        for (let i = 0; i < 6; i++) next[i] = paste[i] || '';
        setCode(next);
        codeRefs.current[Math.min(paste.length, 5)]?.focus();
    };

    // ─── LOGIN ───────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clientes/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefono: loginTel, password: loginPass })
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.pendiente) {
                    setVerifyTel(loginTel);
                    setStep('verify');
                } else {
                    setError(data.error || 'Error al iniciar sesión');
                }
            } else {
                onSuccess(data);
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // ─── REGISTRO ────────────────────────────────────────────
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (regPass !== regPass2) return setError('Las contraseñas no coinciden');
        if (regPass.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clientes/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: regNombre, telefono: regTel, email: regEmail, password: regPass })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Error al registrar');
            } else {
                setVerifyTel(regTel);
                setStep('verify');
                setResendCooldown(60);
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // ─── VERIFICAR CÓDIGO ─────────────────────────────────────
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) return setError('Ingresa los 6 dígitos del código');
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clientes/verificar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefono: verifyTel, codigo: fullCode })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Código incorrecto');
                setCode(['', '', '', '', '', '']);
                codeRefs.current[0]?.focus();
            } else {
                onSuccess(data);
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clientes/reenviar-codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telefono: verifyTel })
            });
            if (res.ok) {
                setResendCooldown(60);
                setSuccessMsg('Código reenviado a tu WhatsApp');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        } catch {
            setError('Error al reenviar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header decorativo */}
                        <div className="bg-[#0f172a] px-8 pt-8 pb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4a017]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                            <img src="/logohd.png" alt="Logo" className="h-10 w-auto mb-4 drop-shadow-xl" />
                            <h2 className="text-white font-black italic text-2xl uppercase tracking-tight leading-none">
                                {step === 'login' && 'Bienvenido de vuelta'}
                                {step === 'register' && 'Crea tu cuenta'}
                                {step === 'verify' && 'Verifica tu número'}
                            </h2>
                            <p className="text-white/50 text-xs font-bold mt-1">
                                {step === 'login' && 'Accede a tus puntos y beneficios exclusivos'}
                                {step === 'register' && 'Únete al programa de lealtad Capriccio'}
                                {step === 'verify' && `Enviamos un código a WhatsApp: ${verifyTel}`}
                            </p>
                        </div>

                        <div className="px-8 py-6">
                            {/* Error / Success */}
                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-wide px-4 py-3 rounded-2xl border border-red-100">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="mb-4 bg-green-50 text-green-600 text-xs font-black uppercase tracking-wide px-4 py-3 rounded-2xl border border-green-100 flex items-center gap-2">
                                    <CheckCircle size={14} /> {successMsg}
                                </div>
                            )}

                            {/* ─── STEP: LOGIN ─── */}
                            {step === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="tel"
                                            placeholder="Número de teléfono"
                                            required
                                            value={loginTel}
                                            onChange={e => setLoginTel(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            required
                                            value={loginPass}
                                            onChange={e => setLoginPass(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
                                    </button>
                                    <p className="text-center text-slate-400 text-xs font-bold">
                                        ¿No tienes cuenta?{' '}
                                        <button type="button" onClick={() => { setStep('register'); setError(''); }} className="text-[#d4a017] hover:underline font-black">
                                            Regístrate gratis
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* ─── STEP: REGISTRO ─── */}
                            {step === 'register' && (
                                <form onSubmit={handleRegister} className="space-y-3">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            required
                                            value={regNombre}
                                            onChange={e => setRegNombre(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="tel"
                                            placeholder="Número de WhatsApp"
                                            required
                                            value={regTel}
                                            onChange={e => setRegTel(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="email"
                                            placeholder="Correo electrónico (opcional)"
                                            value={regEmail}
                                            onChange={e => setRegEmail(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="password"
                                            placeholder="Contraseña (mín. 6 caracteres)"
                                            required
                                            value={regPass}
                                            onChange={e => setRegPass(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input
                                            type="password"
                                            placeholder="Confirmar contraseña"
                                            required
                                            value={regPass2}
                                            onChange={e => setRegPass2(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#d4a017]/40 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#d4a017] text-[#0f172a] py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl hover:bg-[#e5b020] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : '¡Registrarme y recibir código!'}
                                    </button>
                                    <p className="text-center text-slate-400 text-xs font-bold">
                                        ¿Ya tienes cuenta?{' '}
                                        <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-[#0f172a] hover:underline font-black">
                                            Iniciar sesión
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* ─── STEP: VERIFICAR 2FA ─── */}
                            {step === 'verify' && (
                                <form onSubmit={handleVerify} className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-3">
                                            <ShieldCheck className="text-green-500" size={32} />
                                        </div>
                                        <p className="text-slate-500 text-sm font-bold leading-relaxed">
                                            Te enviamos un código de <span className="text-[#0f172a] font-black">6 caracteres</span> por WhatsApp.<br />
                                            Ingresa el código para activar tu cuenta.
                                        </p>
                                    </div>

                                    {/* 6 celdas del código */}
                                    <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                                        {code.map((char, i) => (
                                            <input
                                                key={i}
                                                ref={el => { codeRefs.current[i] = el; }}
                                                type="text"
                                                maxLength={1}
                                                value={char}
                                                onChange={e => handleCodeChange(e.target.value, i)}
                                                onKeyDown={e => handleCodeKeyDown(e, i)}
                                                className="w-12 h-14 text-center text-xl font-black uppercase bg-slate-50 border-2 border-slate-200 focus:border-[#d4a017] rounded-2xl outline-none transition-all text-[#0f172a] tracking-widest"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || code.join('').length < 6}
                                        className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={16} /> Verificar Código</>}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={resendCooldown > 0 || loading}
                                            className="text-xs font-black text-slate-400 hover:text-[#d4a017] transition-colors flex items-center justify-center gap-1.5 mx-auto disabled:opacity-40"
                                        >
                                            <RefreshCw size={12} />
                                            {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
