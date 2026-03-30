'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { CajaItem, CajaTurno } from '@/data/caja-types';
import { API_URL } from '@/lib/socket';
import ProductCustomizationModal from '../ProductCustomizationModal';

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
  turno: CajaTurno;
  onNext: () => void;
  onPrev: () => void;
}

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  activo: boolean;
  precios?: Record<string, number>;
}

const OrderItemsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  turno,
  onNext,
  onPrev,
}) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('🍕 Pizzas');
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState('');
  const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<MenuItem | null>(null);

  useEffect(() => {
    // Cargar menú real del API
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos`);
        if (!response.ok) throw new Error('Error al cargar menú');

        const data = await response.json();

        // Parsear precios si es necesario
        const parsedMenu = data
          .filter((item: any) => item.activo === 1 || item.activo === true)
          .map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio || 0,
            categoria: item.categoria || 'Otros',
            activo: true,
            precios: typeof item.precios === 'string' ? JSON.parse(item.precios) : item.precios,
          }));

        setMenu(parsedMenu);

        // Set primera categoría disponible
        if (parsedMenu.length > 0) {
          const firstCategory = parsedMenu[0].categoria;
          setSelectedCategory(firstCategory);
        }
      } catch (error) {
        console.error('Error cargando menú:', error);
        setShowError('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Obtener categorías únicas del menú
  const categories = Array.from(new Set(menu.map(item => item.categoria))).sort();
  const filteredMenu = menu.filter(item => item.categoria === selectedCategory);

  const addItem = (item: MenuItem) => {
    // Abre modal de customización
    setSelectedProductForCustomization(item);
  };

  const handleAddWithCustomization = (item: MenuItem, options: any) => {
    // Calcula precio con opciones
    const sizeMultipliers: Record<string, number> = {
      chica: 0.85,
      mediana: 1,
      grande: 1.3,
    };

    const basePrice = item.precio;
    const sizeAdjustment = basePrice * (sizeMultipliers[options.size || 'mediana'] - 1);
    const extrasPrice = options.extras.length > 0 ? (options.extras.length * 30) : 0; // Aproximado
    const finalPrice = basePrice + sizeAdjustment + extrasPrice;

    // Nombre con variantes
    const itemName = `${item.nombre} (${options.size || 'mediana'})${options.extras.length > 0 ? ' + extras' : ''}`;

    const newItem: CajaItem = {
      pizza_nombre: itemName,
      cantidad: options.cantidad,
      precio_unitario: finalPrice,
    };

    updateFormData({
      items: [...formData.items, newItem],
    });
  };

  const removeItem = (itemName: string) => {
    const updated = formData.items.filter((i: CajaItem) => i.pizza_nombre !== itemName);
    updateFormData({ items: updated });
  };

  const updateQuantity = (itemName: string, delta: number) => {
    const updated = formData.items.map((i: CajaItem) => {
      if (i.pizza_nombre === itemName) {
        const newQty = i.cantidad + delta;
        return newQty > 0 ? { ...i, cantidad: newQty } : i;
      }
      return i;
    });
    updateFormData({ items: updated });
  };

  const total = formData.items.reduce(
    (sum: number, item: CajaItem) => sum + item.precio_unitario * item.cantidad,
    0
  );

  const handleNext = () => {
    if (formData.items.length === 0) {
      setShowError('Debes agregar al menos un ítem');
      return;
    }
    updateFormData({ total });
    onNext();
  };

  if (loading) {
    return <div className="text-center py-8">Cargando menú...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Selecciona Items</h2>
      <p className="text-gray-600 mb-6">Busca y agrega productos al pedido</p>

      {showError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {showError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MENÚ */}
        <div className="lg:col-span-2">
          {/* CATEGORÍAS */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PRODUCTOS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition text-left"
              >
                <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-red-600 font-bold">${item.precio.toLocaleString()}</span>
                  <Plus size={20} className="text-green-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RESUMEN DE CARRITO */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit sticky top-20">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Carrito</h3>

          {formData.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Sin items</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {formData.items.map((item: CajaItem) => (
                <div key={item.pizza_nombre} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{item.pizza_nombre}</p>
                      <p className="text-red-600 text-sm">
                        ${item.precio_unitario.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.pizza_nombre)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.pizza_nombre, -1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 font-bold text-gray-800">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.pizza_nombre, 1)}
                      className="px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="ml-auto font-semibold text-gray-800">
                      ${(item.precio_unitario * item.cantidad).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-2xl font-bold text-red-600">
                ${total.toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-gray-600">
              {formData.items.length} ítem{formData.items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
        >
          Atrás
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          disabled={formData.items.length === 0}
        >
          Siguiente
        </button>
      </div>

      {/* CUSTOMIZATION MODAL */}
      {selectedProductForCustomization && (
        <ProductCustomizationModal
          product={selectedProductForCustomization}
          onAdd={handleAddWithCustomization}
          onClose={() => setSelectedProductForCustomization(null)}
        />
      )}
    </div>
  );
};

export default OrderItemsStep;
