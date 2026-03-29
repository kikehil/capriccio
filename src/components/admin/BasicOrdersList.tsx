'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, ChevronDown, ChevronUp, Clock, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL, getSocket } from '@/lib/socket';

interface OrderItem {
    nombre: string;
    quantity: number;
    size?: string;
    crust?: string;
    totalItemPrice?: number;
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
    items: OrderItem[];
}

interface BasicOrdersListProps {
    onStatusChange?: () => void;
}

const BasicOrdersList: React.FC<BasicOrdersListProps> = ({ onStatusChange }) => {
    // Get local date in YYYY-MM-DD format regardless of timezone
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '---';
        try {
            // Convert SQLite YYYY-MM-DD HH:mm:ss to ISO YYYY-MM-DDTHH:mm:ss
            const safeStr = dateStr.includes(' ') && !dateStr.includes('T') 
                ? dateStr.replace(' ', 'T') 
                : dateStr;
            const date = new Date(safeStr);
            if (isNaN(date.getTime())) return '---';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '---';
        }
    };

    const [orders, setOrders] = useState<Order[]>([]);
    const [filterDate, setFilterDate] = useState(getLocalDate());
    const [isLoading, setIsLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [isLiquidating, setIsLiquidating] = useState<string | null>(null);

    const fetchOrders = async (date: string) => {
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
    };

    useEffect(() => {
        fetchOrders(filterDate);

        const socket = getSocket();
        if (!socket) return;

        const handleNewOrder = (pedido: any) => {
            // Only add if viewed date is today
            if (filterDate === getLocalDate()) {
                setOrders(prev => {
                    // Avoid duplicates
                    if (prev.find(o => o.order_id === pedido.order_id)) return prev;
                    return [pedido, ...prev];
                });
            }
        };

        socket.on('nuevo_pedido', handleNewOrder);
        return () => {
            socket.off('nuevo_pedido', handleNewOrder);
        };
    }, [filterDate]);

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
                    liquidado_por: 'Administrador (Básico)'
                })
            });

            if (res.ok) {
                // Refresh local list
                await fetchOrders(filterDate);
                // Call parent refresh
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
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm italic shadow-lg",
                                        order.liquidado ? "bg-green-600 text-white" : "bg-slate-900 text-yellow-400"
                                    )}>
                                        {order.liquidado ? <CheckCircle2 size={20} /> : `#${String(order.order_id || order.id).slice(-4).toUpperCase()}`}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase italic leading-none mb-1">
                                            {order.cliente_nombre || 'Cliente Final'}
                                            {order.liquidado === 1 && <span className="ml-2 text-[8px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-widest">LIQUIDADO</span>}
                                        </p>
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(order.created_at)}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md",
                                                order.status === 'entregado' || order.status === 'listo' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                                            )}>{order.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-2xl font-black italic text-slate-900 leading-none">${order.total}</p>
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
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detalle de Productos</h4>
                                                <div className="space-y-3">
                                                    {order.items?.map((item: any, idx) => (
                                                        <div key={idx} className="flex flex-col bg-white p-4 rounded-2xl border border-slate-100">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-black text-slate-800 uppercase italic text-sm">
                                                                        <span className="text-red-600 mr-2">{item.quantity}x</span>
                                                                        {item.nombre}
                                                                    </p>
                                                                    {(item.size || item.crust) && (
                                                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic flex items-center gap-2">
                                                                            {item.size && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">TAMAÑO: {item.size}</span>}
                                                                            {item.crust && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ORILLA: {item.crust}</span>}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="font-black italic text-slate-900 text-sm">
                                                                    ${item.totalItemPrice || (item.precio_unitario * item.quantity)}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* EXTRAS / INGREDIENTES */}
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
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Información de Entrega</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                            <Phone size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Teléfono</p>
                                                            <p className="text-xs font-bold text-slate-700">{order.telefono || 'Sin teléfono'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase">Dirección</p>
                                                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{order.direccion || 'Entrega en sucursal'}</p>
                                                        </div>
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
