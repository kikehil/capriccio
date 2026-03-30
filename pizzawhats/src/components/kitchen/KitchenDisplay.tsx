'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertCircle, RefreshCcw } from 'lucide-react';
import { CartItem } from '@/data/cart';
import { getSocket, API_URL } from '@/lib/socket';
import { cn } from '@/lib/utils';
import OrderCard from './OrderCard';

interface KitchenOrder {
    id: string;
    items: CartItem[];
    createdAt: string;
    timestamp: string;
    status: 'pending' | 'preparing' | 'ready';
    total: number;
    order_id: string;
}

const KitchenDisplay = () => {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [repartidoresOnline, setRepartidoresOnline] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());

    const fetchOrders = async () => {
        setIsLoaded(false);
        console.log("🔍 [Cocina] Sincronizando desde:", `${API_URL}/api/pedidos`);
        try {
            const token = localStorage.getItem('capriccio_token_cocina');
            const response = await fetch(`${API_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();

            // Mapear y filtrar pedidos activos (recibido o preparando)
            // ORDENAR: Más recientes primero para que no se pierdan al final
            const activeOrders = data
                .filter((o: any) => o.status === 'recibido' || o.status === 'preparando' || o.status === 'pending' || o.status === 'pendiente')
                .map((o: any) => ({
                    ...o,
                    order_id: o.order_id || o.id,
                    status: (o.status === 'recibido' || o.status === 'pending' || o.status === 'pendiente') ? 'pending' : 'preparing'
                }))
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(activeOrders);
            setIsLoaded(true);
            setLastSync(new Date());
        } catch (error) {
            console.error("❌ [Cocina] Error al obtener pedidos:", error);
            setIsLoaded(true);
        }
    };

    // 1. Carga inicial de pedidos y Reloj
    useEffect(() => {
        fetchOrders();

        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        };
        updateTime();
        const timer = setInterval(updateTime, 10000);

        return () => clearInterval(timer);
    }, []);

    // 2. Conexión Socket para Sincronización en Tiempo Real
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNuevoPedido = (pedido: any) => {
            console.log("🍕 [Cocina] SOCKET: Nuevo pedido!", pedido.id);

            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch (e) { }

            setOrders(prev => {
                if (prev.some(o => o.id === pedido.id)) return prev;
                return [
                    {
                        ...pedido,
                        order_id: pedido.order_id || pedido.id,
                        createdAt: pedido.createdAt || new Date().toISOString(),
                        status: 'pending'
                    },
                    ...prev
                ];
            });
        };

        socket.on('nuevo_pedido', handleNuevoPedido);
        socket.on('repartidores_online', (reps: any[]) => {
            console.log("🚛 [Cocina] Repartidores online:", reps);
            setRepartidoresOnline(reps);
        });

        return () => {
            socket.off('nuevo_pedido', handleNuevoPedido);
            socket.off('repartidores_online');
        };
    }, []);

    const completeOrder = async (id: string, repartidor?: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        try {
            const token = localStorage.getItem('capriccio_token_cocina');
            const resp = await fetch(`${API_URL}/api/pedidos/${order.order_id || id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'listo',
                    repartidor: repartidor || 'S/A'
                })
            });
            if (resp.ok) {
                setOrders(prev => prev.filter(o => o.id !== id));
            }
        } catch (error) {
            console.error("❌ [Cocina] Error al completar pedido:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-6">
                    <img src="/img/capriccio-logo.svg" alt="Logo" className="w-24 h-24 drop-shadow-lg" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-title font-black italic uppercase tracking-widest text-white leading-none">
                                CENTRO DE <span className="text-capriccio-gold">COCINA</span>
                            </h1>
                            <span className="bg-capriccio-gold/20 text-capriccio-gold text-[10px] font-black px-2 py-0.5 rounded-full border border-capriccio-gold/30">V2.1</span>
                        </div>
                        <p className="text-slate-500 font-medium italic mt-2">Gestión de Pedidos en Tiempo Real</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-capriccio-gold px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-800"
                    >
                        <RefreshCcw className={cn("w-4 h-4", !isLoaded && "animate-spin")} />
                        Sincronizar
                    </button>

                    <div className="text-left md:text-right">
                        <p className="text-4xl font-black text-slate-100 tabular-nums italic uppercase">{currentTime}</p>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Última sincronización: {lastSync.toLocaleTimeString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onComplete={completeOrder}
                            repartidoresOnline={repartidoresOnline}
                        />
                    ))}
                </AnimatePresence>

                {isLoaded && orders.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-700 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem]">
                        <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-2xl font-black italic uppercase tracking-tighter opacity-30">No hay pedidos pendientes</p>
                    </div>
                )}

                {!isLoaded && orders.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-capriccio-gold">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capriccio-gold mb-4"></div>
                        <p className="font-bold uppercase tracking-widest">Sincronizando pedidos...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenDisplay;
