'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, CheckCircle, AlertCircle, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { CajaTurno } from '@/data/caja-types';
import { API_URL } from '@/lib/socket';

interface OrderItem {
  nombre: string;
  quantity: number;
  size?: string;
  totalItemPrice?: number;
  precio_unitario?: number;
}

interface Pedido {
  id: number;
  order_id: string;
  cliente_nombre: string;
  telefono: string;
  direccion: string;
  total: number;
  status: string;
  liquidado: number;
  payment_method?: string;
  metodo_entrega?: string;
  order_origin?: string;
  created_at: string;
  items: OrderItem[];
}

interface BuscarPedidoModalProps {
  turno: CajaTurno;
  onClose: () => void;
}

const BuscarPedidoModal: React.FC<BuscarPedidoModalProps> = ({ turno, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pedido[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    setError('');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length < 2) { setResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem('capriccio_token_caja');
        const res = await fetch(`${API_URL}/api/caja/buscar-pedido?q=${encodeURIComponent(val.trim())}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectPedido = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setMontoRecibido(String(pedido.total));
    setError('');
    setSuccessMsg('');
  };

  const handleCobrar = async () => {
    if (!selectedPedido) return;
    setCobrandoId(selectedPedido.order_id);
    setError('');
    try {
      const token = localStorage.getItem('capriccio_token_caja');
      const res = await fetch(`${API_URL}/api/caja/cobrar-pedido/${selectedPedido.order_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          monto_recibido: parseFloat(montoRecibido) || selectedPedido.total,
          turno_id: turno.id,
          cajero_nombre: turno.cajero_nombre,
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al cobrar');
      }
      setSuccessMsg(`✅ Pedido ${selectedPedido.order_id} cobrado y liquidado`);
      // Quitar de resultados
      setResults(prev => prev.filter(p => p.order_id !== selectedPedido.order_id));
      setSelectedPedido(null);
      setQuery('');
    } catch (e: any) {
      setError(e.message || 'Error al cobrar');
    } finally {
      setCobrandoId(null);
    }
  };

  const cambio = selectedPedido
    ? (parseFloat(montoRecibido) || 0) - selectedPedido.total
    : 0;

  const statusBadge = (s: string, liq: number) => {
    if (liq) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">LIQUIDADO</span>;
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      recibido: 'bg-yellow-100 text-yellow-700',
      preparando: 'bg-blue-100 text-blue-700',
      en_preparacion: 'bg-blue-100 text-blue-700',
      listo: 'bg-green-100 text-green-700',
      entregado: 'bg-slate-100 text-slate-600',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${map[s] || 'bg-slate-100 text-slate-600'}`}>{s}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex items-center gap-3 p-5 border-b">
          <Search size={22} className="text-red-600" />
          <h2 className="text-xl font-black text-gray-900 flex-1">Buscar Pedido para Cobrar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* BUSCADOR */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Número de pedido (ej: ORD-1234)"
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 font-bold text-sm focus:border-red-500 focus:outline-none"
            />
            {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
          </div>

          {/* MENSAJE DE ÉXITO */}
          {successMsg && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-bold text-sm">{successMsg}</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* RESULTADOS */}
          {results.length > 0 && !selectedPedido && (
            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{results.length} resultado(s)</p>
              {results.map(pedido => (
                <button
                  key={pedido.order_id}
                  onClick={() => handleSelectPedido(pedido)}
                  disabled={pedido.liquidado === 1}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    pedido.liquidado
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-gray-900 text-sm">{pedido.order_id}</span>
                    {statusBadge(pedido.status, pedido.liquidado)}
                  </div>
                  <p className="text-xs text-gray-600 font-semibold">{pedido.cliente_nombre || 'Sin nombre'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 capitalize">{pedido.metodo_entrega || '—'}</span>
                    <span className="font-black text-red-600">${pedido.total?.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && query.length >= 2 && !searching && (
            <p className="text-center text-sm text-gray-400 font-bold py-4">No se encontraron pedidos con "{query}"</p>
          )}

          {/* DETALLE + COBRO */}
          {selectedPedido && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedPedido(null)}
                className="text-xs text-gray-500 hover:text-gray-700 font-bold"
              >
                ← Volver a resultados
              </button>

              {/* Resumen del pedido */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-gray-900">{selectedPedido.order_id}</span>
                  {statusBadge(selectedPedido.status, selectedPedido.liquidado)}
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{selectedPedido.cliente_nombre}</p>
                <p className="text-xs text-gray-500 mb-3 capitalize">{selectedPedido.metodo_entrega} · {selectedPedido.order_origin}</p>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {(selectedPedido.items || []).map((item, i) => {
                    const price = Number(item.totalItemPrice) || (Number(item.precio_unitario || 0) * Number(item.quantity || 1));
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}x {item.nombre}{item.size ? ` (${item.size})` : ''}</span>
                        <span className="font-bold text-gray-900">${price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-2 flex justify-between font-black text-lg">
                  <span>Total:</span>
                  <span className="text-red-600">${selectedPedido.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <p className="text-sm font-black text-gray-700 mb-2">Método de Pago</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition ${
                      paymentMethod === 'efectivo'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-400'
                    }`}
                  >
                    <Banknote size={18} /> Efectivo
                  </button>
                  <button
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition ${
                      paymentMethod === 'tarjeta'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <CreditCard size={18} /> Tarjeta
                  </button>
                </div>
              </div>

              {/* Monto recibido (solo efectivo) */}
              {paymentMethod === 'efectivo' && (
                <div>
                  <p className="text-sm font-black text-gray-700 mb-2">Monto Recibido ($)</p>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={e => setMontoRecibido(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 font-bold text-lg focus:border-red-500 focus:outline-none"
                  />
                  {parseFloat(montoRecibido) > 0 && (
                    <div className={`mt-2 flex justify-between font-black text-base px-1 ${cambio >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      <span>Cambio:</span>
                      <span>${cambio.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón cobrar */}
              <button
                onClick={handleCobrar}
                disabled={!!cobrandoId || (paymentMethod === 'efectivo' && parseFloat(montoRecibido) < selectedPedido.total)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-black text-lg transition flex items-center justify-center gap-3"
              >
                {cobrandoId ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                {cobrandoId ? 'Procesando...' : `Cobrar $${selectedPedido.total?.toLocaleString()} y Liquidar`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuscarPedidoModal;
