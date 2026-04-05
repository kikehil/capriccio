'use client';

import React, { useState } from 'react';
import { Search, FileText, CheckCircle, AlertCircle, Download, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/socket';

// ─── Catálogos SAT ────────────────────────────────────────────────────────────

const REGIMENES_FISCALES = [
  { value: '601', label: '601 – General de Ley Personas Morales' },
  { value: '603', label: '603 – Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 – Sueldos y Salarios' },
  { value: '606', label: '606 – Arrendamiento' },
  { value: '608', label: '608 – Demás ingresos' },
  { value: '612', label: '612 – Actividades Empresariales y Profesionales' },
  { value: '616', label: '616 – Sin obligaciones fiscales' },
  { value: '621', label: '621 – Incorporación Fiscal' },
  { value: '625', label: '625 – Actividades por Plataformas Tecnológicas' },
  { value: '626', label: '626 – Régimen Simplificado de Confianza (RESICO)' },
];

const USOS_CFDI = [
  { value: 'G01', label: 'G01 – Adquisición de mercancias' },
  { value: 'G03', label: 'G03 – Gastos en general' },
  { value: 'D01', label: 'D01 – Honorarios médicos y hospitalarios' },
  { value: 'S01', label: 'S01 – Sin efectos fiscales' },
  { value: 'CP01', label: 'CP01 – Pagos' },
];

const FORMAS_PAGO = [
  { value: '01', label: '01 – Efectivo' },
  { value: '03', label: '03 – Transferencia electrónica' },
  { value: '04', label: '04 – Tarjeta de crédito' },
  { value: '28', label: '28 – Tarjeta de débito' },
  { value: '99', label: '99 – Por definir' },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PedidoInfo {
  order_id: string;
  total: number;
  created_at: string;
  metodo_entrega: string;
}

interface FormData {
  rfc: string;
  nombre: string;
  cp_fiscal: string;
  regimen_fiscal: string;
  uso_cfdi: string;
  forma_pago: string;
  email: string;
}

const DELIVERY_LABELS: Record<string, string> = {
  domicilio: 'Domicilio',
  para_llevar: 'Para llevar',
  sucursal: 'Consumo en sucursal',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FacturacionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderId, setOrderId] = useState('');
  const [pedido, setPedido] = useState<PedidoInfo | null>(null);
  const [form, setForm] = useState<FormData>({
    rfc: '',
    nombre: '',
    cp_fiscal: '',
    regimen_fiscal: '',
    uso_cfdi: '',
    forma_pago: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ uuid: string; pdf_base64: string | null } | null>(null);

  // ── Step 1: buscar pedido ──────────────────────────────────────────────────

  const buscarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/facturacion/pedido/${orderId.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al buscar pedido'); return; }
      setPedido(data);
      setStep(2);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: enviar datos fiscales ─────────────────────────────────────────

  const solicitarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/facturacion/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: pedido!.order_id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al generar factura'); return; }
      setResult({ uuid: data.uuid, pdf_base64: data.pdf_base64 });
      setStep(3);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Descargar PDF ─────────────────────────────────────────────────────────

  const descargarPDF = () => {
    if (!result?.pdf_base64) return;
    const bytes = Uint8Array.from(atob(result.pdf_base64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${pedido?.order_id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex flex-col">

      {/* Header */}
      <header className="py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-3xl">🍕</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Capriccio Pizzería</h1>
        </div>
        <p className="text-red-300 text-sm">Facturación en línea</p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-start justify-center px-4 pb-12 pt-4">
        <div className="w-full max-w-lg">

          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {[
              { n: 1, label: 'Ticket' },
              { n: 2, label: 'Datos fiscales' },
              { n: 3, label: 'Listo' },
            ].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > n ? 'bg-green-500 text-white' :
                    step === n ? 'bg-red-500 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {step > n ? '✓' : n}
                  </div>
                  <span className={`text-xs mt-1 ${step === n ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`w-16 h-px mx-2 mb-4 ${step > n ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="text-red-600" size={22} />
                  <h2 className="text-xl font-bold text-slate-800">Busca tu pedido</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  Ingresa el número de ticket que aparece en tu comprobante de compra.
                </p>

                <form onSubmit={buscarPedido} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Número de ticket</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={e => setOrderId(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC123"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-widest text-slate-900 bg-white text-slate-900 bg-white focus:outline-none focus:border-red-500 transition"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !orderId.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {loading ? 'Buscando...' : <>Buscar pedido <ChevronRight size={18} /></>}
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6">
                  Solo puedes facturar pedidos del mes en curso.
                </p>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && pedido && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-red-600" size={22} />
                  <h2 className="text-xl font-bold text-slate-800">Datos fiscales</h2>
                </div>

                {/* Resumen del pedido */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-red-600">{pedido.order_id}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(pedido.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {' · '}
                        {DELIVERY_LABELS[pedido.metodo_entrega] || pedido.metodo_entrega}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">${Number(pedido.total).toLocaleString('es-MX')}</p>
                  </div>
                </div>

                <form onSubmit={solicitarFactura} className="space-y-4">

                  {/* RFC */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">RFC</label>
                    <input
                      type="text"
                      value={form.rfc}
                      onChange={e => setForm(f => ({ ...f, rfc: e.target.value.toUpperCase() }))}
                      placeholder="XAXX010101000"
                      maxLength={13}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-mono uppercase text-slate-900 bg-white focus:outline-none focus:border-red-500 transition"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">Usa XAXX010101000 para público en general</p>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre o Razón Social</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Como aparece en tu constancia fiscal"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:border-red-500 transition"
                      required
                    />
                  </div>

                  {/* CP Fiscal + Régimen */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">CP Fiscal</label>
                      <input
                        type="text"
                        value={form.cp_fiscal}
                        onChange={e => setForm(f => ({ ...f, cp_fiscal: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                        placeholder="64000"
                        maxLength={5}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-mono text-slate-900 bg-white focus:outline-none focus:border-red-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Forma de pago</label>
                      <select
                        value={form.forma_pago}
                        onChange={e => setForm(f => ({ ...f, forma_pago: e.target.value }))}
                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 transition text-sm"
                        required
                      >
                        <option value="">Selecciona</option>
                        {FORMAS_PAGO.map(fp => (
                          <option key={fp.value} value={fp.value}>{fp.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Régimen Fiscal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Régimen Fiscal</label>
                    <select
                      value={form.regimen_fiscal}
                      onChange={e => setForm(f => ({ ...f, regimen_fiscal: e.target.value }))}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 transition text-sm"
                      required
                    >
                      <option value="">Selecciona tu régimen</option>
                      {REGIMENES_FISCALES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Uso CFDI */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Uso del CFDI</label>
                    <select
                      value={form.uso_cfdi}
                      onChange={e => setForm(f => ({ ...f, uso_cfdi: e.target.value }))}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 transition text-sm"
                      required
                    >
                      <option value="">Selecciona el uso</option>
                      {USOS_CFDI.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="tu@correo.com"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:border-red-500 transition"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">Para descargar tu factura desde esta pantalla</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle size={16} className="shrink-0" /> {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); setPedido(null); }}
                      className="flex-1 border-2 border-slate-300 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {loading ? 'Generando...' : <>Generar factura <ChevronRight size={18} /></>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && result && (
              <div className="p-8 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Factura generada!</h2>
                <p className="text-slate-500 mb-6">
                  Tu CFDI 4.0 fue timbrado exitosamente ante el SAT.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Pedido</p>
                  <p className="font-mono font-bold text-red-600 mb-3">{pedido?.order_id}</p>
                  <p className="text-xs text-slate-500 mb-1">Folio fiscal (UUID)</p>
                  <p className="font-mono text-xs text-slate-700 break-all">{result.uuid}</p>
                </div>

                {result.pdf_base64 ? (
                  <button
                    onClick={descargarPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mb-4"
                  >
                    <Download size={18} /> Descargar PDF
                  </button>
                ) : (
                  <p className="text-slate-400 text-sm mb-4">El PDF estará disponible en breve.</p>
                )}

                <button
                  onClick={() => { setStep(1); setOrderId(''); setPedido(null); setResult(null); setForm({ rfc: '', nombre: '', cp_fiscal: '', regimen_fiscal: '', uso_cfdi: '', forma_pago: '', email: '' }); }}
                  className="w-full border-2 border-slate-300 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Facturar otro pedido
                </button>
              </div>
            )}

          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            ¿Tienes dudas? Llámanos al <span className="text-red-400 font-semibold">846-123-4567</span>
          </p>
        </div>
      </main>
    </div>
  );
}
