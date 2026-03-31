'use client';

import React, { useEffect, useRef } from 'react';
import { Delete, Check, X } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  onAccept?: () => void;
  showDot?: boolean;
  anchorRef?: React.RefObject<HTMLElement>; // element to position near
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onClose,
  onAccept,
  showDot = true,
}) => {
  const handleDigit = (digit: string) => onChange(value + digit);

  const handleDot = () => {
    if (!value.includes('.')) onChange(value + '.');
  };

  const handleBackspace = () => onChange(value.slice(0, -1));

  const handleClear = () => onChange('');

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showDot ? '.' : null, '0', 'DEL'],
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-56">
      {/* Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 text-right text-xl font-mono font-bold text-gray-800 min-h-[2.5rem] tracking-wider">
        {value || <span className="text-gray-400 font-normal text-base">0</span>}
      </div>

      {/* Digit grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
        {keys.map((row, rowIdx) =>
          row.map((key, colIdx) => {
            if (!key) return <div key={`empty-${rowIdx}-${colIdx}`} />;

            if (key === 'DEL') {
              return (
                <button
                  key="DEL"
                  onMouseDown={(e) => { e.preventDefault(); handleBackspace(); }}
                  className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center transition"
                >
                  <Delete size={16} />
                </button>
              );
            }

            if (key === '.') {
              return (
                <button
                  key="."
                  onMouseDown={(e) => { e.preventDefault(); handleDot(); }}
                  disabled={value.includes('.')}
                  className="bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-800 font-bold py-2.5 rounded-lg transition text-base"
                >
                  .
                </button>
              );
            }

            return (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); handleDigit(key); }}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 text-gray-800 font-bold py-2.5 rounded-lg transition text-base"
              >
                {key}
              </button>
            );
          })
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
        <button
          onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
          className="bg-orange-400 hover:bg-orange-500 active:bg-orange-600 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
        >
          <X size={14} /> Limpiar
        </button>
        {onAccept ? (
          <button
            onMouseDown={(e) => { e.preventDefault(); onAccept(); }}
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
          >
            <Check size={14} /> OK
          </button>
        ) : onClose ? (
          <button
            onMouseDown={(e) => { e.preventDefault(); onClose(); }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
          >
            <X size={14} /> Cerrar
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default NumericKeypad;
