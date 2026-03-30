'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Clock, Phone, MapPin, CheckCircle2, Bike, Timer, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL, getSocket } from '@/lib/socket';

interface OrderItem {
    nombre: string;
    quantity: number;
    size?: string;
    crust?: string;
    totalItemPrice?: number;
    precio_unitario?: number;
}

interface Order {
    id: string;
    order_id: string;
    cliente_nombre: string;
    telefono: string;
    direccion: string;
    total: number;
    status: string;
    liquidado: number;
    created_at: string;
    delivered_at?: string;
    asignado_at?: string;
    repartidor?: string;
    metodo_entrega?: string;
    notas?: string;
    items: OrderItem[];
}

interface BasicOrdersListProps {
    onStatusChange?: () => void;
}

// Helper: parse date string safely
const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
        const safeStr = dateStr.includes(' ') && !dateStr.includes('T')
            ? dateStr.replace(' ', 'T')
            : dateStr;
        const d = new Date(safeStr);
        return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
};

// Helper: format elapsed time as "Xh Xm Xs"
const formatElapsed = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

// Helper: format elapsed between two dates
const formatElapsedBetween = (startStr: string, endStr: string): string => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end) return '---';
    return formatElapsed(end.getTime() - start.getTime());
};

// Timer component that updates every second
const ElapsedTimer = ({ since, label, colorClass }: { since: string; label?: string; colorClass?: string }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        const update = () => {
            const d = parseDate(since);
            if (!d) { setElapsed('---'); return; }
            setElapsed(formatElapsed(Date.now() - d.getTime()));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [since]);

    return (
        <span className={cn("flex items-center gap-1 tabular-nums", colorClass || "text-amber-600")}>
            <Timer size={10} />
            {label && <span>{label}</span>}
            {elapsed}
        </span>
    );
};

// Status label with color
const StatusLabel = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'NUEVO' },
        'en_preparacion': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'EN PREPARACION' },
        'listo': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'LISTO' },
        'en_reparto': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'EN REPARTO' },
        'despachado': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'DESPACHADO' },
        'entregado': { bg: 'bg-green-100', text: 'text-green-600', label: 'ENTREGADO' },
        'cancelado': { bg: 'bg-red-100', text: 'text-red-600', label: 'CANCELADO' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-500', label: status?.toUpperCase() || '?' };
    return <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest", c.bg, c.text)}>{c.label}</span>;
};

const BasicOrdersList: React.FC<BasicOrdersListProps> = ({ onStatusChange }) => {
    const getLocalDate = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const formatTime = (dateStr: string) => {
        const d = parseDate(dateStr);
        if (!d) return '---';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const [orders, setOrders] = useState<Order[]>([]);
    const [filterDate, setFilterDate] = useState(getLocalDate());
    const [isLoading, setIsLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [isLiquidating, setIsLiquidating] = useState<string | null>(null);
    const [, setTick] = useState(0); // Force re-render for timers

    // Re-render every 10 seconds so the elapsed times update even without individual timers
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = useCallback(async (date: string) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(`${API_URL}/api/admin/reportes?inicio=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error('Error fetching orders:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(filterDate);

        const socket = getSocket();
        if (!socket) return;

        const handleNewOrder = (pedido: any) => {
            if (filterDate === getLocalDate()) {
                setOrders(prev => {
                    if (prev.find(o => o.order_id === pedido.order_id)) return prev;
                    return [pedido, ...prev];
                });
            }
        };

        // Refrescar al cambiar status de pedido
        const handleStatusUpdate = () => {
            if (filterDate === getLocalDate()) fetchOrders(filterDate);
        };

        socket.on('nuevo_pedido', handleNewOrder);
        socket.on('pedido_status_update', handleStatusUpdate);
        socket.on('pedidos_liquidados', handleStatusUpdate);
        return () => {
            socket.off('nuevo_pedido', handleNewOrder);
            socket.off('pedido_status_update', handleStatusUpdate);
            socket.off('pedidos_liquidados', handleStatusUpdate);
        };
    }, [filterDate, fetchOrders]);

    const handleLiquidar = async (orderId: string) => {
        setIsLiquidating(orderId);
        try {
            const token = localStorage.getItem('capriccio_token_admin');
            const res = await fetch(`${API_URL}/api/admin/liquidar-pedidos`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_ids: [orderId],
                    liquidado_por: 'Administrador (Basico)'
                })
            });

            if (res.ok) {
                await fetchOrders(filterDate);
                if (onStatusChange) onStatusChange();
            }
        } catch (e) {
            console.error('Error liquidating order:', e);
        } finally {
            setIsLiquidating(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    // Determinar si un pedido aun no fue entregado (para mostrar timer activo)
    const isPending = (order: Order) =>
        !['entregado', 'cancelado'].includes(order.status);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Listado de Pedidos</h2>
                    <p className="text-slate-400 font-bold italic text-sm mt-1">Consulta tus ventas diarias en detalle.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-700 w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando pedidos...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <p className="font-bold text-slate-300 uppercase tracking-widest text-sm italic">No hay pedidos registrados para esta fecha</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className={cn(
                                "bg-white rounded-[2rem] border overflow-hidden transition-all hover:shadow-lg",
                                order.liquidado ? "border-green-100 bg-green-50/10" : "border-slate-100"
                            )}
                        >
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => toggleExpand(order.id)}>
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm italic shadow-lg shrink-0",
                                        order.liquidado ? "bg-green-600 text-white" : "bg-slate-900 text-yellow-400"
                                    )}>
                                        {order.liquidado ? <CheckCircle2 size={20} /> : `#${String(order.order_id || order.id).slice(-4).toUpperCase()}`}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 uppercase italic leading-none mb-1 truncate">
                                            {order.cliente_nombre || 'Cliente Final'}
                                            {order.liquidado === 1 && <span className="ml-2 text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-widest">LIQUIDADO</span>}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <Clock size={10} /> {formatTime(order.created_at)}
                                            </span>
                                            <StatusLabel status={order.status} />
                                            {/* Timer ascendente: tiempo transcurrido */}
                                            {isPending(order) ? (
                                                <ElapsedTimer
                                                    since={order.created_at}
                                                    colorClass={
                                                        (() => {
                                                            const d = parseDate(order.created_at);
                                                            if (!d) return 'text-amber-500';
                                                            const mins = (Date.now() - d.getTime()) / 60000;
                                                            if (mins > 30) return 'text-red-600 font-black';
                                                            if (mins > 15) return 'text-amber-600';
                                                            return 'text-blue-500';
                                                        })()
                                                    }
                                                />
                                            ) : order.status === 'entregado' && order.delivered_at ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 size={10} />
                                                    {formatElapsedBetween(order.created_at, order.delivered_at)}
                                                </span>
                                            ) : null}
                                            {/* Repartidor asignado */}
                                            {order.repartidor && order.repartidor !== 'S/A' && order.repartidor !== 'sucursal' && (
                                                <span className="flex items-center gap-1 text-purple-500">
                                                    <Bike size={10} /> {order.repartidor}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-2xl font-black italic text-slate-900 leading-none">${Number(order.total || 0).toLocaleString()}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!order.liquidado && (
                                            <button
                                                onClick={() => handleLiquidar(order.order_id)}
                                                disabled={isLiquidating === order.order_id}
                                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-black italic uppercase text-xs hover:bg-black transition-all shadow-lg shadow-red-200 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isLiquidating === order.order_id ? "..." : "Liquidar"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleExpand(order.id)}
                                            className="p-2 bg-slate-50 rounded-full text-slate-400"
                                        >
                                            {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedOrder === order.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-slate-50 bg-slate-50/50"
                                    >
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Detalle de productos */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detalle de Productos</h4>
                                                <div className="space-y-3">
                                                    {order.items?.map((item: any, idx) => {
                                                        const price = Number(item.totalItemPrice) || (Number(item.precio_unitario || 0) * Number(item.quantity || 1));
                                                        return (
                                                            <div key={idx} className="flex flex-col bg-white p-4 rounded-2xl border border-slate-100">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-black text-slate-800 uppercase italic text-sm">
                                                                            <span className="text-red-600 mr-2">{item.quantity}x</span>
                                                                            {item.nombre}
                                                                        </p>
                                                                        {(item.size || item.crust) && (
                                                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic flex items-center gap-2 flex-wrap">
                                                                                {item.size && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">TAMANO: {item.size}</span>}
                                                                                {item.crust && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ORILLA: {item.crust}</span>}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="font-black italic text-slate-900 text-sm shrink-0 ml-2">
                                                                        ${price > 0 ? price.toLocaleString() : '---'}
                                                                    </div>
                                                                </div>

                                                                {item.extras && item.extras.length > 0 && (
                                                                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                                                                        {item.extras.map((ex: any, i: number) => (
                                                                            <span key={i} className="text-[9px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100 uppercase italic">
                                                                                + {ex.nombre}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Informacion de Entrega */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informacion de Entrega</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                            <Phone size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Telefono</p>
                                                            <p className="text-xs font-bold text-slate-700">{order.telefono || 'Sin telefono'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Direccion</p>
                                                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{order.direccion || 'Entrega en sucursal'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Repartidor asignado */}
                                                    {order.repartidor && order.repartidor !== 'S/A' && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 shrink-0">
                                                                <Bike size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase">Repartidor</p>
                                                                <p className="text-xs font-bold text-purple-700">{order.repartidor === 'sucursal' ? 'Entrega en sucursal' : order.repartidor}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metodo de entrega */}
                                                    {order.metodo_entrega && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                                <Package size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase">Metodo de Entrega</p>
                                                                <p className="text-xs font-bold text-slate-700 capitalize">{order.metodo_entrega}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Notas */}
                                                    {order.notas && (
                                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                                            <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Notas del Cliente</p>
                                                            <p className="text-xs font-bold text-amber-800 italic">{order.notas}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tiempos */}
                                                <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiempos</h4>
                                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Recibido</p>
                                                            <p className="font-bold text-slate-700">{formatTime(order.created_at)}</p>
                                                        </div>
                                                        {order.delivered_at && (
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase">Entregado</p>
                                                                <p className="font-bold text-slate-700">{formatTime(order.delivered_at)}</p>
                                                            </div>
                                                        )}
                                                        {order.status === 'entregado' && order.delivered_at ? (
                                                            <div className="col-span-2 bg-green-50 rounded-xl p-3 border border-green-100">
                                                                <p className="text-[9px] font-black text-green-600 uppercase">Tiempo Total de Entrega</p>
                                                                <p className="font-black text-green-700 text-lg italic">
                                                                    {formatElapsedBetween(order.created_at, order.delivered_at)}
                                                                </p>
                                                            </div>
                                                        ) : isPending(order) ? (
                                                            <div className="col-span-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                                                                <p className="text-[9px] font-black text-amber-600 uppercase">Tiempo Transcurrido</p>
                                                                <p className="font-black text-amber-700 text-lg italic">
                                                                    <ElapsedTimer since={order.created_at} colorClass="text-amber-700 text-lg" />
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BasicOrdersList;
