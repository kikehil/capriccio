'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, User } from 'lucide-react';
import { CajaTurno } from '@/data/caja-types';
import { API_URL } from '@/lib/socket';

interface CashRegisterStats {
  total_ordenes: number;
  total_efectivo: number;
  total_tarjeta: number;
  total_ingresos: number;
}

interface OrdenDetalle {
  id: number;
  order_id: string;
  cliente_nombre: string;
  total: number;
  payment_method?: string;
  metodo_entrega?: string;
  order_origin?: string;
  cajero_nombre?: string;
  liquidado_por?: string;
  liquidado: number;
  status: string;
  created_at: string;
}

interface CashRegisterPanelProps {
  turno: CajaTurno;
}

const CashRegisterPanel: React.FC<CashRegisterPanelProps> = ({ turno }) => {
  const [stats, setStats] = useState<CashRegisterStats>({
    total_ordenes: 0,
    total_efectivo: 0,
    total_tarjeta: 0,
    total_ingresos: 0,
  });
  const [ordenes, setOrdenes] = useState<OrdenDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  // Duración calculada por el servidor (segundos), libre de timezone
  const [duracionBase, setDuracionBase] = useState<number>(0);
  const [duracionBaseAt, setDuracionBaseAt] = useState<number>(Date.now());
  const [horaAperturaUTC, setHoraAperturaUTC] = useState<string>('');
  const [tickSecs, setTickSecs] = useState<number>(0);

  // Ticker de 1 segundo para la duración live
  useEffect(() => {
    const t = setInterval(() => {
      setTickSecs(Math.floor((Date.now() - duracionBaseAt) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [duracionBaseAt]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refrescar cada 10 segundos
    return () => clearInterval(interval);
  }, [turno.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/caja/reporte/turno/${turno.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('capriccio_token_caja')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const resumen = data.resumen;
        setStats({
          total_ordenes: resumen.total_ordenes || 0,
          total_efectivo: resumen.total_efectivo || 0,
          total_tarjeta: resumen.total_tarjeta || 0,
          total_ingresos: (resumen.total_efectivo || 0) + (resumen.total_tarjeta || 0),
        });
        if (data.ordenes) setOrdenes(data.ordenes);
        // Sincronizar duración desde el servidor (evita drift de timezone)
        if (data.turno?.duracion_segundos != null) {
          setDuracionBase(Number(data.turno.duracion_segundos));
          setDuracionBaseAt(Date.now());
          setTickSecs(0);
        }
        if (data.turno?.hora_apertura_utc) {
          setHoraAperturaUTC(data.turno.hora_apertura_utc);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando datos...</div>;
  }

  const cards = [
    {
      title: 'Órdenes Procesadas',
      value: stats.total_ordenes,
      icon: <TrendingUp className="text-blue-600" size={32} />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Efectivo',
      value: `$${stats.total_efectivo.toLocaleString()}`,
      icon: <DollarSign className="text-green-600" size={32} />,
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Tarjetas',
      value: `$${stats.total_tarjeta.toLocaleString()}`,
      icon: <DollarSign className="text-purple-600" size={32} />,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Total Ingresos',
      value: `$${stats.total_ingresos.toLocaleString()}`,
      icon: <DollarSign className="text-red-600" size={32} />,
      color: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-6 ${card.color}`}
          >
            <div className="flex items-center gap-4">
              {card.icon}
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFORMACIÓN DEL TURNO */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Información del Turno</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Cajero</p>
            <p className="font-bold text-lg text-gray-800">{turno.cajero_nombre}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Efectivo Inicial</p>
            <p className="font-bold text-lg text-gray-800">${turno.efectivo_inicial.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Hora de Apertura</p>
            <p className="font-bold text-lg text-gray-800">
              {horaAperturaUTC || (turno.abierto_at ? turno.abierto_at.split(' ')[1] || '—' : '—')}
              <span className="text-xs text-gray-400 ml-1">UTC</span>
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Duración del Turno</p>
            <p className="font-bold text-lg text-gray-800">
              {(() => {
                const totalSecs = duracionBase + tickSecs;
                if (totalSecs < 0) return '0h 0m';
                const h = Math.floor(totalSecs / 3600);
                const m = Math.floor((totalSecs % 3600) / 60);
                return `${h}h ${m}m`;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* DETALLE DE PEDIDOS DEL TURNO */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Detalle de Pedidos del Turno</h3>
          <p className="text-sm text-gray-500 mt-1">{ordenes.length} pedido(s) en este turno</p>
        </div>
        {ordenes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-semibold">Sin pedidos registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Entrega</th>
                  <th className="px-4 py-3 text-left">Origen</th>
                  <th className="px-4 py-3 text-left">Pago</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Cajero / Cobró</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenes.map((o) => {
                  const pagoLabel: Record<string, string> = {
                    efectivo: 'Efectivo', tarjeta: 'Tarjeta', no_pago: 'Sin cobro',
                  };
                  const entregaLabel: Record<string, string> = {
                    domicilio: 'Domicilio', sucursal: 'Sucursal', para_llevar: 'Para Llevar',
                  };
                  const origenColor: Record<string, string> = {
                    web: 'bg-blue-100 text-blue-700',
                    llamada: 'bg-yellow-100 text-yellow-700',
                    presencial: 'bg-purple-100 text-purple-700',
                  };
                  const cobrador = o.cajero_nombre || o.liquidado_por || (o.liquidado ? 'Caja' : '—');
                  return (
                    <tr key={o.order_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">{o.order_id}</td>
                      <td className="px-4 py-3 text-gray-700">{o.cliente_nombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {entregaLabel[o.metodo_entrega || ''] || o.metodo_entrega || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${origenColor[o.order_origin || ''] || 'bg-gray-100 text-gray-600'}`}>
                          {o.order_origin || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {pagoLabel[o.payment_method || ''] || o.payment_method || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-600">
                        ${Number(o.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {cobrador}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {o.liquidado ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">Liquidado</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            o.status === 'entregado' ? 'bg-slate-100 text-slate-600' :
                            o.status === 'listo' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{o.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 font-bold text-gray-700">Total del Turno</td>
                  <td className="px-4 py-3 text-right font-black text-xl text-red-600">
                    ${ordenes.reduce((s, o) => s + Number(o.total || 0), 0).toLocaleString()}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* NOTA */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <p className="text-blue-800 font-semibold mb-2">💡 Nota</p>
        <p className="text-blue-700 text-sm">
          Las estadísticas se actualizan automáticamente. Cuando estés listo para cerrar el turno,
          ve a la pestaña <strong>"Cerrar Turno"</strong> para finalizar.
        </p>
      </div>
    </div>
  );
};

export default CashRegisterPanel;
