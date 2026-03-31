'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertCircle, RefreshCcw, ChefHat, Bike, Store, ShoppingBag } from 'lucide-react';
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
    metodo_entrega?: string;
    direccion?: string;
}

// Intenta renovar el token silenciosamente; devuelve true si tuvo éxito
const refreshToken = async (): Promise<boolean> => {
    try {
        const token = localStorage.getItem('capriccio_token_cocina');
        if (!token) return false;
        const resp = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem('capriccio_token_cocina', data.token);
            console.log('🔄 [Cocina] Token renovado automáticamente');
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

const KitchenDisplay = () => {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [repartidoresOnline, setRepartidoresOnline] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [sessionExpired, setSessionExpired] = useState(false);

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

            // Mapear y filtrar pedidos activos (recibido, preparando, en_preparacion)
            // ORDENAR: Más recientes primero para que no se pierdan al final
            const activeOrders = data
                .filter((o: any) => o.status === 'recibido' || o.status === 'preparando' || o.status === 'pending' || o.status === 'pendiente' || o.status === 'en_preparacion')
                .map((o: any) => ({
                    ...o,
                    id: o.order_id || o.id,
                    order_id: o.order_id || o.id,
                    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
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

    // 1. Carga inicial de pedidos, Reloj y renovación automática de token cada 12h
    useEffect(() => {
        fetchOrders();

        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        };
        updateTime();
        const timer = setInterval(updateTime, 10000);

        // Renovar token cada 12 horas para que nunca expire en cocina
        const tokenRefreshInterval = setInterval(async () => {
            console.log('🔑 [Cocina] Renovación periódica de token...');
            await refreshToken();
        }, 12 * 60 * 60 * 1000);

        return () => {
            clearInterval(timer);
            clearInterval(tokenRefreshInterval);
        };
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
                const resolvedId = pedido.order_id || pedido.id;
                if (prev.some(o => o.id === resolvedId)) return prev;
                return [
                    {
                        ...pedido,
                        id: resolvedId,
                        order_id: resolvedId,
                        createdAt: pedido.created_at || pedido.createdAt || new Date().toISOString(),
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

        // Re-fetch on reconnect (missed events while disconnected)
        const handleReconnect = () => {
            console.log("🔄 [Cocina] Socket reconectado — refrescando pedidos");
            fetchOrders();
        };
        socket.on('connect', handleReconnect);

        return () => {
            socket.off('nuevo_pedido', handleNuevoPedido);
            socket.off('repartidores_online');
            socket.off('connect', handleReconnect);
        };
    }, []);

    // 3. Re-sync cuando la pantalla vuelve a estar visible (tablet/móvil)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                console.log("👁️ [Cocina] Pantalla visible — refrescando pedidos");
                fetchOrders();
                // Reconectar socket si se desconectó
                const socket = getSocket();
                if (socket && !socket.connected) {
                    socket.connect();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // Wrapper para PATCH con manejo automático de 401/403: renueva token y reintenta
    const patchWithAuth = async (url: string, body: object): Promise<boolean> => {
        const doFetch = async () => {
            const token = localStorage.getItem('capriccio_token_cocina');
            return fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
        };
        try {
            let resp = await doFetch();
            if (resp.status === 401 || resp.status === 403) {
                console.warn('⚠️ [Cocina] Token expirado, renovando...');
                const refreshed = await refreshToken();
                if (refreshed) {
                    resp = await doFetch(); // reintento con nuevo token
                } else {
                    setSessionExpired(true);
                    return false;
                }
            }
            if (!resp.ok) return false;
            setSessionExpired(false);
            return true;
        } catch (error) {
            console.error('Error PATCH:', error);
            return false;
        }
    };

    const startPreparation = async (id: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        const ok = await patchWithAuth(
            `${API_URL}/api/pedidos/${order.order_id || id}/status`,
            { status: 'en_preparacion' }
        );
        if (ok) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'preparing' } : o));
        }
    };

    const generateTicketPDF = (order: KitchenOrder) => {
        // Generar ticket como ventana de impresión
        const items = order.items.map(item => {
            let line = `${item.quantity}x ${item.nombre}`;
            if ((item as any).size) line += ` (${(item as any).size})`;
            if ((item as any).crust) line += ` - ${(item as any).crust}`;
            const extras = item.extras?.map((e: any) => e.nombre).join(', ');
            if (extras) line += `\n   + ${extras}`;
            return line;
        }).join('\n');

        const orderId = order.order_id || order.id;
        const shortId = orderId.split('-')[1] || orderId.slice(-4);
        const fecha = new Date().toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const ticketHTML = `
<!DOCTYPE html>
<html><head><title>Ticket #${shortId}</title>
<style>
    body { font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 10px; font-size: 12px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 8px 0; }
    .item { margin: 4px 0; }
    h2 { margin: 4px 0; font-size: 16px; }
    @media print { body { width: 100%; } }
</style></head>
<body>
    <div class="center bold"><h2>CAPRICCIO PIZZERIA</h2></div>
    <div class="line"></div>
    <div class="center bold">PEDIDO #${shortId}</div>
    <div class="center">${fecha}</div>
    ${(order as any).nombre_cliente ? `<div>Cliente: ${(order as any).nombre_cliente}</div>` : ''}
    ${(order as any).telefono_cliente ? `<div>Tel: ${(order as any).telefono_cliente}</div>` : ''}
    ${(order as any).metodo_entrega ? `<div>Entrega: ${(order as any).metodo_entrega}</div>` : ''}
    ${(order as any).direccion ? `<div>Dir: ${(order as any).direccion}</div>` : ''}
    <div class="line"></div>
    <pre style="white-space:pre-wrap;font-size:12px;">${items}</pre>
    <div class="line"></div>
    ${order.total ? `<div class="bold" style="text-align:right;font-size:14px;">TOTAL: $${order.total.toLocaleString()}</div>` : ''}
    ${(order as any).notas ? `<div class="line"></div><div>Notas: ${(order as any).notas}</div>` : ''}
    <div class="line"></div>
    <div class="center" style="font-size:10px;color:#888;">PEDIDO LISTO - IMPRESO DESDE COCINA</div>
</body></html>`;

        const w = window.open('', '_blank', 'width=320,height=500');
        if (w) {
            w.document.write(ticketHTML);
            w.document.close();
            setTimeout(() => { w.print(); }, 300);
        }
    };

    const completeOrder = async (id: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        const ok = await patchWithAuth(
            `${API_URL}/api/pedidos/${order.order_id || id}/status`,
            { status: 'listo' }
        );
        if (ok) {
            generateTicketPDF(order);
            setOrders(prev => prev.filter(o => o.id !== id));
        }
    };

    const completeInStore = async (id: string) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;
        const ok = await patchWithAuth(
            `${API_URL}/api/pedidos/${order.order_id || id}/status`,
            { status: 'entregado', repartidor: 'sucursal' }
        );
        if (ok) {
            setOrders(prev => prev.filter(o => o.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            {sessionExpired && (
                <div className="mb-6 flex items-center gap-4 bg-red-900/70 border border-red-600 text-red-200 px-6 py-4 rounded-2xl">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={22} />
                    <p className="font-bold text-sm flex-1">
                        ⚠️ Sesión expirada — los botones no responden. Renovando sesión...
                    </p>
                    <button
                        onClick={async () => {
                            const ok = await refreshToken();
                            if (ok) setSessionExpired(false);
                            else window.location.reload();
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition"
                    >
                        Renovar
                    </button>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-6">
                    <img src="/logohd.png" alt="Logo" className="h-20 w-auto drop-shadow-lg" />
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

            {!isLoaded && orders.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-capriccio-gold">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capriccio-gold mb-4"></div>
                    <p className="font-bold uppercase tracking-widest">Sincronizando pedidos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── COLUMNA 1: A DOMICILIO ─────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-900/40 border border-blue-700/40">
                            <Bike className="text-blue-400" size={22} />
                            <h2 className="text-sm font-black uppercase italic tracking-widest text-blue-300 flex-1">Entrega a Domicilio</h2>
                            <span className="text-lg font-black italic text-blue-400">
                                {orders.filter(o => o.metodo_entrega === 'domicilio' || (!o.metodo_entrega && o.direccion !== 'Recoger en sucursal')).length}
                            </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {orders
                                .filter(o => o.metodo_entrega === 'domicilio' || (!o.metodo_entrega && o.direccion !== 'Recoger en sucursal'))
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onComplete={completeOrder}
                                        onCompleteInStore={completeInStore}
                                        onStartPreparation={startPreparation}
                                    />
                                ))}
                        </AnimatePresence>
                        {isLoaded && orders.filter(o => o.metodo_entrega === 'domicilio' || (!o.metodo_entrega && o.direccion !== 'Recoger en sucursal')).length === 0 && (
                            <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[2rem]">
                                <p className="text-xs font-black italic uppercase tracking-widest text-slate-700 opacity-50">Sin pedidos</p>
                            </div>
                        )}
                    </div>

                    {/* ── COLUMNA 2: PARA LLEVAR ─────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-900/40 border border-green-700/40">
                            <ShoppingBag className="text-green-400" size={22} />
                            <h2 className="text-sm font-black uppercase italic tracking-widest text-green-300 flex-1">Para Llevar</h2>
                            <span className="text-lg font-black italic text-green-400">
                                {orders.filter(o => o.metodo_entrega === 'para_llevar').length}
                            </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {orders
                                .filter(o => o.metodo_entrega === 'para_llevar')
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onComplete={completeOrder}
                                        onCompleteInStore={completeInStore}
                                        onStartPreparation={startPreparation}
                                    />
                                ))}
                        </AnimatePresence>
                        {isLoaded && orders.filter(o => o.metodo_entrega === 'para_llevar').length === 0 && (
                            <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[2rem]">
                                <p className="text-xs font-black italic uppercase tracking-widest text-slate-700 opacity-50">Sin pedidos</p>
                            </div>
                        )}
                    </div>

                    {/* ── COLUMNA 3: CONSUMO EN SUCURSAL ────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-900/40 border border-amber-700/40">
                            <Store className="text-amber-400" size={22} />
                            <h2 className="text-sm font-black uppercase italic tracking-widest text-amber-300 flex-1">Consumo en Sucursal</h2>
                            <span className="text-lg font-black italic text-amber-400">
                                {orders.filter(o => o.metodo_entrega === 'sucursal' || o.direccion === 'Recoger en sucursal').length}
                            </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {orders
                                .filter(o => o.metodo_entrega === 'sucursal' || o.direccion === 'Recoger en sucursal')
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onComplete={completeOrder}
                                        onCompleteInStore={completeInStore}
                                        onStartPreparation={startPreparation}
                                    />
                                ))}
                        </AnimatePresence>
                        {isLoaded && orders.filter(o => o.metodo_entrega === 'sucursal' || o.direccion === 'Recoger en sucursal').length === 0 && (
                            <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[2rem]">
                                <p className="text-xs font-black italic uppercase tracking-widest text-slate-700 opacity-50">Sin pedidos</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KitchenDisplay;
