'use client';

import React, { useState, useEffect } from 'react';
import { Eye, AlertCircle } from 'lucide-react';
import { CajaTurno } from '@/data/caja-types';

interface OrderSummary {
  order_id: string;
  cliente_nombre: string;
  status: string;
  total: number;
  metodo_entrega: string;
  created_at: string;
}

interface ActiveOrdersListProps {
  turno: CajaTurno;
}

const ActiveOrdersList: React.FC<ActiveOrdersListProps> = ({ turno }) => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'pendientes' | 'listos'>('todos');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refrescar cada 5 segundos
    return () => clearInterval(interval);
  }, [turno.id]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/caja/pedidos/turno/${turno.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('capriccio_token_caja')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'pendientes') {
      return order.status === 'recibido' || order.status === 'en_preparacion';
    }
    if (filter === 'listos') {
      return order.status === 'listo';
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    recibido: 'bg-blue-100 text-blue-800',
    en_preparacion: 'bg-yellow-100 text-yellow-800',
    preparando: 'bg-orange-100 text-orange-800',
    listo: 'bg-green-100 text-green-800',
    en_reparto: 'bg-purple-100 text-purple-800',
    entregado: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    recibido: 'Recibido',
    en_preparacion: 'En Preparación',
    preparando: 'Preparando',
    listo: 'Listo',
    en_reparto: 'En Reparto',
    entregado: 'Entregado',
  };

  const deliveryLabels: Record<string, string> = {
    sucursal: '🏪 Sucursal',
    para_llevar: '🛍️ Para Llevar',
    domicilio: '🚚 Domicilio',
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando órdenes...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin órdenes</h3>
        <p className="text-gray-500">No hay órdenes en este turno</p>
      </div>
    );
  }

  return (
    <div>
      {/* FILTROS */}
      <div className="flex gap-2 mb-6">
        {(['todos', 'pendientes', 'listos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f === 'todos' && `Todos (${orders.length})`}
            {f === 'pendientes' &&
              `Pendientes (${orders.filter((o) => o.status === 'recibido' || o.status === 'en_preparacion').length})`}
            {f === 'listos' && `Listos (${orders.filter((o) => o.status === 'listo').length})`}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.order_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono font-bold text-lg text-red-600">{order.order_id}</p>
                <p className="text-sm text-gray-600">{order.cliente_nombre}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Tipo:</span>{' '}
                <span className="font-semibold">{deliveryLabels[order.metodo_entrega] || order.metodo_entrega}</span>
              </p>
              <p>
                <span className="text-gray-600">Total:</span>{' '}
                <span className="font-bold text-green-600">${order.total.toLocaleString()}</span>
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(order.created_at).toLocaleTimeString('es-CL')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-gray-600">
            {filter === 'pendientes' && 'No hay órdenes pendientes'}
            {filter === 'listos' && 'No hay órdenes listas'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveOrdersList;
