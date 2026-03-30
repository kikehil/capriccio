'use client';

import React from 'react';
import { Phone, Users } from 'lucide-react';
import { OrderOrigin, CajaTurno } from '@/data/caja-types';

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  turno: CajaTurno;
  onNext: () => void;
  onPrev: () => void;
}

const OrderOriginStep: React.FC<StepProps> = ({ formData, updateFormData, onNext }) => {
  const handleSelect = (origin: OrderOrigin) => {
    updateFormData({ order_origin: origin });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Cómo llega el pedido?</h2>
      <p className="text-gray-600 mb-6">Selecciona el canal de origen del pedido</p>

      <div className="grid grid-cols-1 gap-4">
        {/* LLAMADA TELEFONICA */}
        <button
          onClick={() => handleSelect('llamada')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
        >
          <div className="flex items-center gap-4">
            <Phone className="text-red-600 group-hover:scale-110 transition" size={32} />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-800">Llamada Telefónica</h3>
              <p className="text-sm text-gray-600">Cliente llamó para hacer su pedido</p>
            </div>
          </div>
        </button>

        {/* PRESENCIAL */}
        <button
          onClick={() => handleSelect('presencial')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition group"
        >
          <div className="flex items-center gap-4">
            <Users className="text-red-600 group-hover:scale-110 transition" size={32} />
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-800">Presencial en Sucursal</h3>
              <p className="text-sm text-gray-600">Cliente está en el local</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Nota:</strong> Usa "Presencial" si el cliente está en el local, incluso si es por teléfono desde afuera.
        </p>
      </div>
    </div>
  );
};

export default OrderOriginStep;
