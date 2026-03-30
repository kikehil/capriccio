'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CajaTurno, NewOrderRequest } from '@/data/caja-types';

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  turno: CajaTurno;
  onReset: () => void;
}

const ConfirmationStep: React.FC<StepProps> = ({ formData, turno, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      // Preparar datos
      const payload: NewOrderRequest = {
        cliente_nombre: formData.cliente_nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
        referencias: formData.referencias,
        items: formData.items,
        order_origin: formData.order_origin,
        metodo_entrega: formData.metodo_entrega,
        payment_method: formData.payment_method || 'no_pago',
        monto_recibido: formData.monto_recibido,
        turno_id: turno.id,
      };

      // Enviar al API
      const response = await fetch('/api/caja/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('capriccio_token_caja')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al crear pedido');
      }

      const result = await response.json();
      setOrderId(result.order_id);
      setSuccess(true);

      // Generar y descargar recibo
      if (formData.metodo_entrega === 'sucursal' || formData.metodo_entrega === 'para_llevar') {
        generateAndPrintReceipt(result);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const generateAndPrintReceipt = (orderData: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200], // Tamaño térmico 80mm
    });

    // Configurar fuentes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CAPRICCIO PIZZERÍA', 40, 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Orden: ${orderData.order_id}`, 40, 18, { align: 'center' });
    doc.text(`${new Date().toLocaleString('es-CL')}`, 40, 23, { align: 'center' });

    let yPos = 32;

    // Cliente
    if (formData.cliente_nombre) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('CLIENTE:', 5, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(formData.cliente_nombre, 5, yPos);
      yPos += 4;
      doc.text(formData.telefono, 5, yPos);
      yPos += 6;
    }

    // Items
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ITEMS:', 5, yPos);
    yPos += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    formData.items.forEach((item: any) => {
      const line = `${item.cantidad}x ${item.pizza_nombre}`;
      doc.text(line, 5, yPos);
      yPos += 3;
      doc.text(`  $${(item.precio_unitario * item.cantidad).toLocaleString()}`, 50, yPos);
      yPos += 4;
    });

    // Separador
    yPos += 2;
    doc.setDrawColor(0);
    doc.line(5, yPos, 75, yPos);
    yPos += 4;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', 5, yPos);
    doc.text(`$${formData.total.toLocaleString()}`, 50, yPos);
    yPos += 8;

    // Pago
    if (formData.payment_method && formData.payment_method !== 'no_pago') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const methodText =
        formData.payment_method === 'efectivo' ? 'EFECTIVO' : 'TARJETA';
      doc.text(`Pago: ${methodText}`, 5, yPos);
      yPos += 4;

      if (formData.payment_method === 'efectivo' && formData.monto_recibido) {
        const cambio = formData.monto_recibido - formData.total;
        doc.text(`Recibido: $${formData.monto_recibido.toLocaleString()}`, 5, yPos);
        yPos += 4;
        doc.text(`Cambio: $${cambio.toLocaleString()}`, 5, yPos);
        yPos += 4;
      }
    }

    // Nota de entrega
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const deliveryText =
      formData.metodo_entrega === 'sucursal'
        ? `COMER EN SUCURSAL`
        : `PARA LLEVAR`;
    doc.text(`TIPO: ${deliveryText}`, 5, yPos);

    // Gracias
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('¡GRACIAS POR SU COMPRA!', 40, yPos, { align: 'center' });

    // Descargar
    doc.save(`recibo-${orderData.order_id}.pdf`);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Pedido Creado!</h2>
        <p className="text-gray-600 mb-6">
          Orden: <span className="font-mono font-bold text-green-600 text-xl">{orderId}</span>
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p className="text-blue-800 font-semibold">✅ El pedido ha sido enviado a cocina</p>
          {(formData.metodo_entrega === 'sucursal' || formData.metodo_entrega === 'para_llevar') && (
            <p className="text-blue-700 text-sm mt-2">
              Se imprimió automáticamente el recibo. Guárdalo para entregarlo al cliente.
            </p>
          )}
        </div>

        <button
          onClick={onReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition text-lg"
        >
          Crear Otro Pedido
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmar Pedido</h2>
      <p className="text-gray-600 mb-6">Revisa los datos antes de finalizar</p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* CLIENTE */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Cliente</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Nombre:</span>{' '}
              <span className="font-semibold">{formData.cliente_nombre}</span>
            </p>
            <p>
              <span className="text-gray-600">Teléfono:</span>{' '}
              <span className="font-semibold">{formData.telefono}</span>
            </p>
            {formData.direccion && (
              <p>
                <span className="text-gray-600">Dirección:</span>{' '}
                <span className="font-semibold">{formData.direccion}</span>
              </p>
            )}
          </div>
        </div>

        {/* PEDIDO */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Pedido</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Origen:</span>{' '}
              <span className="font-semibold capitalize">{formData.order_origin}</span>
            </p>
            <p>
              <span className="text-gray-600">Entrega:</span>{' '}
              <span className="font-semibold capitalize">{formData.metodo_entrega}</span>
            </p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Items ({formData.items.length})</h3>
          <div className="space-y-2 text-sm">
            {formData.items.map((item: any) => (
              <div key={item.pizza_nombre} className="flex justify-between">
                <span>
                  {item.cantidad}x {item.pizza_nombre}
                </span>
                <span className="font-semibold">${(item.precio_unitario * item.cantidad).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAGO */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3">Pago</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-red-600">${formData.total.toLocaleString()}</span>
            </div>
            {formData.payment_method && formData.payment_method !== 'no_pago' && (
              <>
                <p>
                  <span className="text-gray-600">Método:</span>{' '}
                  <span className="font-semibold capitalize">{formData.payment_method}</span>
                </p>
                {formData.payment_method === 'efectivo' && (
                  <>
                    <p>
                      <span className="text-gray-600">Recibido:</span>{' '}
                      <span className="font-semibold">${formData.monto_recibido?.toLocaleString()}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Cambio:</span>{' '}
                      <span className="font-semibold text-green-600">
                        ${(formData.monto_recibido - formData.total).toLocaleString()}
                      </span>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
      >
        {loading ? 'Procesando...' : '✅ Confirmar y Enviar a Cocina'}
      </button>
    </div>
  );
};

export default ConfirmationStep;
