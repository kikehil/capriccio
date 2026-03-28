'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, ChefHat, Bike, CheckCircle, Star, Loader2 } from 'lucide-react';
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

interface Props {
    open: boolean;
    onClose: () => void;
    token: string;
    telefono: string;
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

export default function MisPedidosModal({ open, onClose, token, telefono }: Props) {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

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

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetchPedidos();

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
                        <div className="bg-[#0f172a] px-7 py-6 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-white font-black italic text-xl uppercase tracking-tight">Mis Pedidos</h2>
                                <p className="text-white/40 text-xs font-bold">Historial y seguimiento en tiempo real</p>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
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
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
