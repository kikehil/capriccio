'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import CustomerInfoStep from './steps/CustomerInfoStep';
import OrderOriginStep from './steps/OrderOriginStep';
import DeliveryMethodStep from './steps/DeliveryMethodStep';
import OrderItemsStep from './steps/OrderItemsStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';
import { CajaTurno, OrderOrigin, DeliveryMethod, PaymentMethod, CajaItem } from '@/data/caja-types';

type StepType = 'origin' | 'delivery' | 'customer' | 'items' | 'payment' | 'confirmation';

interface FormData {
  order_origin?: OrderOrigin;
  metodo_entrega?: DeliveryMethod;
  cliente_nombre: string;
  telefono: string;
  direccion?: string;
  referencias?: string;
  items: CajaItem[];
  total: number;
  payment_method?: PaymentMethod;
  monto_recibido?: number;
}

interface NewOrderFormProps {
  turno: CajaTurno;
}

const stepOrder: StepType[] = ['origin', 'delivery', 'customer', 'items', 'payment', 'confirmation'];

const NewOrderForm: React.FC<NewOrderFormProps> = ({ turno }) => {
  const [currentStep, setCurrentStep] = useState<StepType>('origin');
  const [formData, setFormData] = useState<FormData>({
    cliente_nombre: '',
    telefono: '',
    items: [],
    total: 0,
  });

  const currentStepIndex = stepOrder.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepOrder.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(stepOrder[currentStepIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    }
  };

  const handleReset = () => {
    setCurrentStep('origin');
    setFormData({
      cliente_nombre: '',
      telefono: '',
      items: [],
      total: 0,
    });
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Render step component
  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      turno,
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (currentStep) {
      case 'origin':
        return <OrderOriginStep {...commonProps} />;
      case 'delivery':
        return <DeliveryMethodStep {...commonProps} />;
      case 'customer':
        return <CustomerInfoStep {...commonProps} />;
      case 'items':
        return <OrderItemsStep {...commonProps} />;
      case 'payment':
        return <PaymentStep {...commonProps} />;
      case 'confirmation':
        return <ConfirmationStep {...commonProps} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {stepOrder.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    index <= currentStepIndex
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < stepOrder.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      index < currentStepIndex ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Paso {currentStepIndex + 1} de {stepOrder.length}
          </p>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                isFirstStep
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft size={20} />
              Atrás
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOrderForm;
