'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, ChefHat, Bike, CheckCircle, Star, Loader2, Gift, TrendingUp, Plus, Minus } from 'lucide-react';
import { API_URL } from '@/lib/socket';
import { getSocket } from '@/lib/socket';

interface Pedido {
    order_id: string;
    items: any[];
    total: number;
    status: string;
    created_at: string;
    delivered_at: string | null;
    repartidor: string | null;
    calificacion: number;
    calificacion_comentario: string | null;
}

interface PuntosMovimiento {
    puntos: number;
    motivo: string;
    descripcion: string | null;
    created_at: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    token: string;
    telefono: string;
    initialTab?: 'pedidos' | 'puntos';
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
    pending: { label: 'Recibido', color: 'text-blue-500', icon: <Package size={16} />, step: 1 },
    en_preparacion: { label: 'En Preparación', color: 'text-amber-500', icon: <ChefHat size={16} />, step: 2 },
    listo: { label: 'En Reparto', color: 'text-purple-500', icon: <Bike size={16} />, step: 3 },
    entregado: { label: 'Entregado', color: 'text-green-600', icon: <CheckCircle size={16} />, step: 4 },
};

function TrackingBar({ status }: { status: string }) {
    const steps = [
        { key: 'pending', label: 'Recibido', icon: <Package size={14} /> },
        { key: 'en_preparacion', label: 'Preparando', icon: <ChefHat size={14} /> },
        { key: 'listo', label: 'En Reparto', icon: <Bike size={14} /> },
        { key: 'entregado', label: 'Entregado', icon: <CheckCircle size={14} /> },
    ];
    const currentStep = STATUS_MAP[status]?.step || 1;

    return (
        <div className="flex items-center justify-between mt-3 mb-1">
            {steps.map((s, i) => {
                const done = currentStep > i + 1;
                const active = currentStep === i + 1;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-[#0f172a] text-[#d4a017] ring-2 ring-[#d4a017]/40' : 'bg-slate-100 text-slate-300'}`}>
                                {s.icon}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wide ${active ? 'text-[#0f172a]' : done ? 'text-green-600' : 'text-slate-300'}`}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-slate-100'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function StarRating({ orderId, token, onDone }: { orderId: string; token: string; onDone: () => void }) {
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [comentario, setComentario] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await fetch(`${API_URL}/api/pedidos/${orderId}/calificacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ estrellas: selected, comentario })
            });
            setDone(true);
            setTimeout(onDone, 1500);
        } catch { } finally { setSaving(false); }
    };

    if (done) return (
        <div className="text-center py-2">
            <CheckCircle className="text-green-500 mx-auto mb-1" size={20} />
            <p className="text-xs font-black text-green-600">¡Gracias por tu calificación!</p>
        </div>
    );

    return (
        <div className="bg-amber-50 rounded-2xl p-4 mt-3 border border-amber-100">
            <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-2 text-center">¿Cómo fue tu experiencia?</p>
            <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                    <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setSelected(n)}>
                        <Star size={28} className={`transition-all ${n <= (hovered || selected) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                ))}
            </div>
            {selected > 0 && (
                <>
                    <textarea
                        placeholder="Comentario opcional..."
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                        className="w-full text-xs bg-white border border-amber-200 rounded-xl p-2 outline-none resize-none font-bold text-slate-700"
                        rows={2}
                    />
                    <button onClick={handleSave} disabled={saving}
                        className="mt-2 w-full bg-[#0f172a] text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : 'Enviar Calificación'}
                    </button>
                </>
            )}
        </div>
    );
}

const MOTIVO_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; signo: '+' | '-' }> = {
    registro:   { label: 'Bienvenida',     color: 'text-emerald-600 bg-emerald-50', icon: <Gift size={14} />,       signo: '+' },
    pedido:     { label: 'Pedido',         color: 'text-blue-600 bg-blue-50',      icon: <Package size={14} />,    signo: '+' },
    promocion:  { label: 'Promoción',      color: 'text-purple-600 bg-purple-50',  icon: <Star size={14} />,       signo: '+' },
    canje:      { label: 'Canje',          color: 'text-amber-600 bg-amber-50',    icon: <TrendingUp size={14} />, signo: '-' },
    ajuste:     { label: 'Ajuste',         color: 'text-slate-600 bg-slate-100',   icon: <TrendingUp size={14} />, signo: '+' },
};

export default function MisPedidosModal({ open, onClose, token, telefono, initialTab = 'pedidos' }: Props) {
    const [activeTab, setActiveTab] = useState<'pedidos' | 'puntos'>(initialTab);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
    const [puntosBalance, setPuntosBalance] = useState(0);
    const [puntosHistorial, setPuntosHistorial] = useState<PuntosMovimiento[]>([]);
    const [puntosLoading, setPuntosLoading] = useState(false);

    const fetchPedidos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/clientes/mis-pedidos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPedidos(data.map((p: any) => ({ ...p, items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items })));
            }
        } catch { } finally { setLoading(false); }
    };

    const fetchPuntos = async () => {
        setPuntosLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/clientes/puntos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPuntosBalance(data.puntos);
                setPuntosHistorial(data.historial);
            }
        } catch { } finally { setPuntosLoading(false); }
    };

    useEffect(() => {
        if (!open) return;
        setActiveTab(initialTab);
        setLoading(true);
        fetchPedidos();
        fetchPuntos();

        const socket = getSocket();
        if (!socket) return;

        const handleTracking = (data: any) => {
            if (data.telefono_cliente !== telefono) return;
            setPedidos(prev => prev.map(p => p.order_id === data.order_id ? { ...p, status: data.status, repartidor: data.repartidor } : p));
            // Show rating when delivered
            if (data.status === 'entregado') setRatingOrderId(data.order_id);
        };

        socket.on('pedido_tracking_update', handleTracking);
        return () => { socket.off('pedido_tracking_update', handleTracking); };
    }, [open, telefono]);

    const formatDate = (str: string) => {
        try { return new Date(str.includes(' ') ? str.replace(' ', 'T') : str).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
        catch { return str; }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

                        {/* Header */}
                        <div className="bg-[#0f172a] px-7 py-6 shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-white font-black italic text-xl uppercase tracking-tight">
                                        {activeTab === 'pedidos' ? 'Mis Pedidos' : 'Mis Puntos'}
                                    </h2>
                                    <p className="text-white/40 text-xs font-bold">
                                        {activeTab === 'pedidos' ? 'Historial y seguimiento en tiempo real' : 'Programa de lealtad Capriccio'}
                                    </p>
                                </div>
                                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('pedidos')}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'pedidos' ? 'bg-[#d4a017] text-[#0f172a]' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                >
                                    <Package size={12} /> Pedidos
                                </button>
                                <button
                                    onClick={() => { setActiveTab('puntos'); fetchPuntos(); }}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'puntos' ? 'bg-[#d4a017] text-[#0f172a]' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                >
                                    <Star size={12} /> Puntos
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">

                        {/* ── TAB: PUNTOS ── */}
                        {activeTab === 'puntos' && (
                            <>
                                {puntosLoading ? (
                                    <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                                        <Loader2 size={32} className="animate-spin" />
                                        <p className="font-bold text-sm">Cargando puntos...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Tarjeta de saldo */}
                                        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Saldo actual</p>
                                            <div className="flex items-end gap-2 mb-3">
                                                <span className="text-[#d4a017] font-black text-5xl leading-none">{puntosBalance}</span>
                                                <span className="text-white/50 font-bold mb-1">puntos</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={11} className="text-[#d4a017]" fill="currentColor" />
                                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Programa de lealtad Capriccio</p>
                                            </div>
                                        </div>

                                        {/* Historial */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Movimientos</p>
                                            {puntosHistorial.length === 0 ? (
                                                <div className="py-10 text-center text-slate-300">
                                                    <Gift size={36} className="mx-auto mb-2 opacity-30" />
                                                    <p className="font-black italic uppercase text-sm">Sin movimientos aún</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {puntosHistorial.map((mov, i) => {
                                                        const cfg = MOTIVO_CONFIG[mov.motivo] || MOTIVO_CONFIG['ajuste'];
                                                        const esPositivo = mov.puntos > 0;
                                                        return (
                                                            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-3">
                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                                                                    {cfg.icon}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-[#0f172a] text-xs truncate">{mov.descripcion || cfg.label}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold">{formatDate(mov.created_at)}</p>
                                                                </div>
                                                                <div className={`flex items-center gap-0.5 font-black text-sm shrink-0 ${esPositivo ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                    {esPositivo ? <Plus size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
                                                                    {Math.abs(mov.puntos)} pts
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* ── TAB: PEDIDOS ── */}
                        {activeTab === 'pedidos' && <>
                            {loading && (
                                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                                    <Loader2 size={32} className="animate-spin" />
                                    <p className="font-bold text-sm">Cargando pedidos...</p>
                                </div>
                            )}
                            {!loading && pedidos.length === 0 && (
                                <div className="py-20 text-center text-slate-300">
                                    <Package size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-black italic uppercase">Aún no tienes pedidos</p>
                                    <p className="text-xs font-bold mt-1">¡Haz tu primer pedido!</p>
                                </div>
                            )}
                            {!loading && pedidos.map(p => {
                                const statusInfo = STATUS_MAP[p.status] || STATUS_MAP['pending'];
                                const isActive = !['entregado'].includes(p.status);
                                const needsRating = p.status === 'entregado' && !p.calificacion;
                                const items = Array.isArray(p.items) ? p.items : [];

                                return (
                                    <div key={p.order_id} className={`bg-white rounded-[1.5rem] border-2 p-4 ${isActive ? 'border-[#d4a017]/40 shadow-lg shadow-[#d4a017]/5' : 'border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-black text-[#0f172a] italic uppercase text-sm">#{p.order_id.split('-')[1] || p.order_id.slice(-6)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{formatDate(p.created_at)}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${isActive ? 'bg-amber-50' : 'bg-green-50'} ${statusInfo.color}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="text-xs text-slate-600 font-bold mb-1">
                                            {items.slice(0, 2).map((item: any, i: number) => (
                                                <span key={i}>{item.quantity}x {item.nombre}{i < Math.min(items.length, 2) - 1 ? ', ' : ''}</span>
                                            ))}
                                            {items.length > 2 && <span className="text-slate-400"> +{items.length - 2} más</span>}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-[#0f172a] italic">${Number(p.total).toLocaleString()}</span>
                                            {p.repartidor && p.repartidor !== 'S/A' && p.repartidor !== 'sucursal' && (
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Bike size={10} /> {p.repartidor}
                                                </span>
                                            )}
                                        </div>

                                        {/* Tracking bar - only for active or recent */}
                                        {(isActive || p.status === 'entregado') && <TrackingBar status={p.status} />}

                                        {/* Rating */}
                                        {needsRating && (
                                            <StarRating orderId={p.order_id} token={token} onDone={fetchPedidos} />
                                        )}
                                        {p.calificacion > 0 && (
                                            <div className="flex items-center gap-1 mt-2">
                                                {[1,2,3,4,5].map(n => (
                                                    <Star key={n} size={12} className={n <= p.calificacion ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                                ))}
                                                {p.calificacion_comentario && <span className="text-[10px] text-slate-400 font-bold ml-1">"{p.calificacion_comentario}"</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
