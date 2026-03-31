'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Package, Clock, Navigation, RefreshCcw, Bike, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepartidorMap } from './MapIndex';
import { getSocket, API_URL } from '@/lib/socket';

interface DeliveryOrder {
    id: string;
    cliente_nombre: string;
    direccion: string;
    telefono: string;
    items: any[];
    total: number;
    timestamp: string;
    lat?: number;
    lng?: number;
    order_id: string;
    createdAt?: string;
    repartidor?: string;
}

const DeliveryDashboard = () => {
    const [pedidosListos, setPedidosListos] = useState<DeliveryOrder[]>([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [currentPos, setCurrentPos] = useState<{ lat: number, lng: number } | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);

    // Auth State
    const [repartidorName, setRepartidorName] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState('');

    const fetchInitialOrders = async () => {
        setIsLoaded(false);
        try {
            const token = localStorage.getItem('capriccio_token_repartidor');
            const res = await fetch(`${API_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                const listos = data
                    .filter(p => p.status === 'listo')
                    .map(p => ({
                        ...p,
                        order_id: p.order_id || p.id,
                        id: p.order_id || p.id.toString(),
                        timestamp: p.timestamp || new Date(p.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }))
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

                setPedidosListos(listos);
            }
            setIsLoaded(true);
        } catch (e) {
            console.error("Error loading orders:", e);
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        const savedName = localStorage.getItem('capriccio_repartidor_nombre');
        if (savedName) setRepartidorName(savedName);

        fetchInitialOrders();

        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn(err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        setSocketConnected(socket.connected);

        if (repartidorName) {
            socket.emit('registro_repartidor', repartidorName);
        }

        const handleConnect = () => {
            setSocketConnected(true);
            if (repartidorName) socket.emit('registro_repartidor', repartidorName);
        };
        const handleDisconnect = () => setSocketConnected(false);

        const handlePedidoListo = (pedido: any) => {
            setPedidosListos(prev => {
                if (prev.some(p => p.id === pedido.id)) return prev;
                return [
                    {
                        ...pedido,
                        order_id: pedido.order_id || pedido.id,
                        id: pedido.order_id || pedido.id.toString(),
                        timestamp: pedido.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                    ...prev
                ];
            });
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        };

        const handleEntregadoRemoto = (id: string) => {
            setPedidosListos(prev => prev.filter(p => p.id !== id));
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('pedido_listo_reparto', handlePedidoListo);
        socket.on('pedido_entregado_remoto', handleEntregadoRemoto);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('pedido_listo_reparto', handlePedidoListo);
            socket.off('pedido_entregado_remoto', handleEntregadoRemoto);
        };
    }, [repartidorName]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        localStorage.setItem('capriccio_repartidor_nombre', nameInput);
        setRepartidorName(nameInput);
        const socket = getSocket();
        if (socket) socket.emit('registro_repartidor', nameInput);
    };

    const handleLogout = () => {
        localStorage.removeItem('capriccio_repartidor_nombre');
        setRepartidorName(null);
    };

    const marcarEntregado = async (id: string) => {
        const order = pedidosListos.find(p => p.id === id);
        if (!order) return;
        try {
            const token = localStorage.getItem('capriccio_token_repartidor');
            const res = await fetch(`${API_URL}/api/pedidos/${order.order_id || id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'entregado',
                    repartidor: repartidorName
                })
            });
            if (res.ok) {
                setPedidosListos(prev => prev.filter(p => p.id !== id));
                if (selectedOrder?.id === id) setIsMapOpen(false);
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error || 'No se pudo marcar como entregado'}`);
            }
        } catch (error) {
            console.error("Error al entregar:", error);
            alert("Error de conexión con el servidor. Verifica tu internet.");
        }
    };

    const handleOpenMap = async (pedido: DeliveryOrder) => {
        if (!pedido.lat || !pedido.lng) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pedido.direccion)}`);
                const data = await res.json();
                if (data[0]) {
                    pedido.lat = parseFloat(data[0].lat);
                    pedido.lng = parseFloat(data[0].lon);
                } else {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.direccion)}`, '_blank');
                    return;
                }
            } catch (e) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.direccion)}`, '_blank');
                return;
            }
        }
        setSelectedOrder(pedido);
        setIsMapOpen(true);
    };

    // Filtrar pedidos: Los del repartidor actual primero
    const misPedidos = pedidosListos.filter(p => p.repartidor === repartidorName);
    const otrosPedidos = pedidosListos.filter(p => p.repartidor !== repartidorName);

    if (!repartidorName) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl text-center"
                >
                    <div className="w-20 h-20 bg-capriccio-gold rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-xl shadow-capriccio-gold/20">
                        <Bike size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Identificación</h2>
                    <p className="text-slate-400 font-bold italic text-sm mb-8">Ingresa tu nombre para empezar a recibir pedidos asignados.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="TU NOMBRE (Ej: Juan)"
                            className="w-full bg-slate-50 p-6 rounded-2xl font-black italic uppercase outline-none border-2 border-transparent focus:border-capriccio-gold focus:bg-white transition-all text-center"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            autoFocus
                        />
                        <button className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black italic uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
                            ENTRAR A TURNO
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-20">
            <header className="bg-slate-950 text-white p-6 pt-12 rounded-b-[2.5rem] shadow-2xl sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-title font-black uppercase tracking-tighter italic leading-none">Reparto <span className="text-capriccio-gold">Capriccio</span></h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                <User size={12} className="text-capriccio-gold" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{repartidorName}</span>
                                <button onClick={handleLogout} className="ml-1 text-red-500 hover:text-red-400"><LogOut size={12} /></button>
                            </div>
                            <div className={cn("w-2 h-2 rounded-full", socketConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 animate-pulse")} />
                        </div>
                    </div>
                    <button
                        onClick={fetchInitialOrders}
                        className="p-3 bg-white/10 rounded-2xl text-capriccio-gold hover:bg-white/20 transition-all active:scale-90"
                    >
                        <RefreshCcw size={20} className={cn(!isLoaded && "animate-spin")} />
                    </button>
                </div>
            </header>

            <main className="p-4 space-y-6 mt-4">
                {/* Mis Pedidos Asignados */}
                {misPedidos.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-4">
                            <Sparkles size={16} className="text-capriccio-gold" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Mis Asignaciones</h3>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {misPedidos.map((pedido) => (
                                <OrderCardView key={pedido.id} pedido={pedido} isOwn onDeliver={marcarEntregado} onMap={handleOpenMap} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Otros Pedidos (Sin asignar o para otros) */}
                {otrosPedidos.length > 0 && (
                    <div className="space-y-4">
                        <div className="h-[1px] bg-slate-200 mx-8 my-8" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic ml-4">Otros Pedidos Listos</h3>
                        <AnimatePresence mode="popLayout">
                            {otrosPedidos.map((pedido) => (
                                <OrderCardView key={pedido.id} pedido={pedido} isOwn={false} onDeliver={marcarEntregado} onMap={handleOpenMap} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {pedidosListos.length === 0 && isLoaded && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                        <Package size={60} className="opacity-10 mb-4" />
                        <p className="font-black italic uppercase tracking-widest text-sm opacity-30">Todo entregado</p>
                    </div>
                )}
            </main>

            {selectedOrder && (
                <RepartidorMap
                    isOpen={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    destination={{ lat: selectedOrder.lat!, lng: selectedOrder.lng!, address: selectedOrder.direccion }}
                    currentPos={currentPos}
                />
            )}
        </div>
    );
};

const OrderCardView = ({ pedido, isOwn, onDeliver, onMap }: { pedido: DeliveryOrder, isOwn: boolean, onDeliver: any, onMap: any }) => (
    <motion.div
        layout
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={cn(
            "rounded-[2rem] shadow-lg border overflow-hidden transition-all duration-500",
            isOwn ? "bg-white border-capriccio-gold ring-2 ring-capriccio-gold/20" : "bg-white border-slate-200 opacity-60 grayscale-[0.5]"
        )}
    >
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isOwn ? "bg-capriccio-gold text-slate-900" : "bg-slate-900 text-slate-400")}>
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xl font-black italic text-slate-900 uppercase leading-tight">{pedido.cliente_nombre}</p>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {isOwn ? 'Asignado a ti' : `Asignado a: ${pedido.repartidor || 'Nadie'}`}
                        </span>
                    </div>
                </div>
                <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", isOwn ? "bg-capriccio-accent text-white border-capriccio-accent/20" : "bg-slate-100 text-slate-500 border-slate-200")}>
                    {isOwn ? '¡Lleva esto!' : 'LISTO'}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <MapPin className="text-capriccio-gold" size={20} />
                    <p className="text-sm font-bold text-slate-800 leading-tight flex-1">{pedido.direccion}</p>
                </div>

                {/* --- DETALLE DEL PEDIDO --- */}
                {pedido.items && pedido.items.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contenido de la entrega</h4>
                        <ul className="space-y-1">
                            {pedido.items.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-700 italic">
                                    <span className="text-capriccio-gold font-black">{item.quantity}x</span> {item.nombre}
                                    {item.extras && item.extras.length > 0 && (
                                        <span className="text-xs text-red-500 ml-1">(+ {item.extras.map((e: any) => e.nombre).join(', ')})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onMap(pedido)} className="flex items-center justify-center gap-3 bg-slate-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Navigation size={18} className="text-capriccio-gold" /> MAPA
                    </button>
                    <a href={`tel:${pedido.telefono}`} className="flex items-center justify-center gap-3 bg-slate-100 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 active:scale-95 transition-all">
                        <Phone size={18} /> LLAMAR
                    </a>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 italic">
                    <Clock size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">{pedido.timestamp}</span>
                </div>
                <p className="text-base font-black text-slate-900 italic">${pedido.total}</p>
            </div>

            {(isOwn || !pedido.repartidor || pedido.repartidor === 'S/A' || pedido.repartidor.toUpperCase() === 'NADIE') && (
                <button
                    onClick={() => onDeliver(pedido.id)}
                    className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-lg italic uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    <CheckCircle2 size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> ENTREGADO
                </button>
            )}
        </div>
    </motion.div>
);

const Sparkles = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

export default DeliveryDashboard;
