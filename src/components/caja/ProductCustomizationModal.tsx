'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { API_URL } from '@/lib/socket';

interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  activo: boolean;
  precios?: Record<string, number>;
}

interface CustomizationOptions {
  size?: string;
  crust?: string;
  extras: string[];
  cantidad: number;
  specialty2?: string; // para mitad y mitad
}

interface ProductCustomizationModalProps {
  selectedProductId?: number;
  onAdd: (pizza: Pizza, options: CustomizationOptions) => void;
  onClose: () => void;
}

const SIZES = ['chica', 'mediana', 'grande'];
const SIZE_PRICES: Record<string, number> = {
  chica: 0.85,
  mediana: 1,
  grande: 1.3,
};

const CRUST_OPTIONS = [
  { id: 'sin-orilla', nombre: 'Sin Orilla Rellena', precio: 0 },
  { id: 'orilla-queso', nombre: 'Orilla Rellena de Queso', precio: 45 },
  { id: 'dedos-queso', nombre: 'Dedos de Queso', precio: 30 },
];

const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  selectedProductId,
  onAdd,
  onClose,
}) => {
  const [products, setProducts] = useState<Pizza[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Pizza | null>(null);
  const [options, setOptions] = useState<CustomizationOptions>({
    size: 'mediana',
    crust: 'sin-orilla',
    extras: [],
    cantidad: 1,
  });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'product-select' | 'customize'>('product-select');

  // Cargar productos del API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();

        const filtered = data
          .filter((p: any) => p.activo === 1 || p.activo === true)
          .map((p: any) => ({
            ...p,
            precios: typeof p.precios === 'string' ? JSON.parse(p.precios) : p.precios,
          }));

        setProducts(filtered);

        // Si viene seleccionado un producto, preselectar
        if (selectedProductId) {
          const selected = filtered.find((p: Pizza) => p.id === selectedProductId);
          if (selected) {
            setSelectedProduct(selected);
            setStep('customize');
          }
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedProductId]);

  // Calcular precios
  const getProductPrice = (pizza: Pizza, size: string) => {
    if (pizza.precios && pizza.precios[size]) {
      return pizza.precios[size];
    }
    return pizza.precio * (SIZE_PRICES[size] || 1);
  };

  const basePrice = selectedProduct
    ? getProductPrice(selectedProduct, options.size || 'mediana')
    : 0;

  const crustPrice = CRUST_OPTIONS.find((c) => c.id === options.crust)?.precio || 0;
  const unitPrice = basePrice + crustPrice;
  const totalPrice = unitPrice * options.cantidad;

  const handleSelectProduct = (pizza: Pizza) => {
    setSelectedProduct(pizza);
    setStep('customize');
    setOptions({ size: 'mediana', crust: 'sin-orilla', extras: [], cantidad: 1 });
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      onAdd(selectedProduct, options);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  // STEP 1: Seleccionar Producto
  if (step === 'product-select') {
    const categories = Array.from(new Set(products.map((p) => p.categoria))).sort();

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Selecciona un Producto</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products
                    .filter((p) => p.categoria === category)
                    .map((pizza) => (
                      <button
                        key={pizza.id}
                        onClick={() => handleSelectProduct(pizza)}
                        className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-red-600 transition p-0"
                      >
                        {/* IMAGEN */}
                        {pizza.imagen && (
                          <img
                            src={pizza.imagen}
                            alt={pizza.nombre}
                            className="w-full h-40 object-cover group-hover:scale-110 transition"
                          />
                        )}
                        {!pizza.imagen && (
                          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Sin imagen</span>
                          </div>
                        )}

                        {/* INFO */}
                        <div className="p-3 bg-white">
                          <h4 className="font-bold text-sm text-gray-800 truncate">{pizza.nombre}</h4>
                          <p className="text-red-600 font-bold text-sm">
                            desde ${pizza.precio.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Customizar Producto
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedProduct?.nombre}</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedProduct?.descripcion}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* IMAGEN */}
          {selectedProduct?.imagen && (
            <div className="flex justify-center">
              <img
                src={selectedProduct.imagen}
                alt={selectedProduct.nombre}
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* TAMAÑO */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Tamaño</h3>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map((size) => {
                const price = getProductPrice(selectedProduct!, size);
                return (
                  <button
                    key={size}
                    onClick={() => setOptions((prev) => ({ ...prev, size }))}
                    className={`p-4 rounded-lg border-2 transition font-semibold text-center ${
                      options.size === size
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-800 hover:border-red-300'
                    }`}
                  >
                    <div className="capitalize">{size}</div>
                    <div className="text-sm mt-1">${price.toLocaleString()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ORILLA */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Orilla Rellena</h3>
            <div className="space-y-2">
              {CRUST_OPTIONS.map((crust) => (
                <label
                  key={crust.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="crust"
                    checked={options.crust === crust.id}
                    onChange={() => setOptions((prev) => ({ ...prev, crust: crust.id }))}
                    className="w-4 h-4 text-red-600"
                  />
                  <div className="flex-1 ml-3">
                    <p className="font-medium text-gray-800">{crust.nombre}</p>
                  </div>
                  {crust.precio > 0 && <span className="text-red-600 font-bold">+${crust.precio}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* CANTIDAD */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setOptions((prev) => ({
                    ...prev,
                    cantidad: Math.max(1, prev.cantidad - 1),
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                {options.cantidad}
              </span>
              <button
                onClick={() =>
                  setOptions((prev) => ({
                    ...prev,
                    cantidad: prev.cantidad + 1,
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* RESUMEN DE PRECIO */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Precio unitario:</span>
                <span>${unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Cantidad:</span>
                <span>{options.cantidad}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-red-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-4">
          <button
            onClick={() => {
              setStep('product-select');
              setSelectedProduct(null);
            }}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Otro Producto
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Agregar (${totalPrice.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationModal;
