'use client';

import React from 'react';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  showDot?: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onClose,
  showDot = true,
}) => {
  const handleDigit = (digit: string) => {
    onChange(value + digit);
  };

  const handleDot = () => {
    if (!value.includes('.')) {
      onChange(value + '.');
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showDot ? '.' : '', '0', 'DEL'],
  ];

  return (
    <div className="bg-gray-100 rounded-lg p-2 grid grid-cols-3 gap-2">
      {keys.map((row, rowIdx) => (
        <React.Fragment key={rowIdx}>
          {row.map((key) => {
            if (!key) {
              return <div key={`empty-${rowIdx}`} />;
            }

            if (key === 'DEL') {
              return (
                <button
                  key={key}
                  onClick={handleBackspace}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded flex items-center justify-center transition"
                  title="Borrar"
                >
                  <Delete size={20} />
                </button>
              );
            }

            if (key === '.') {
              return (
                <button
                  key={key}
                  onClick={handleDot}
                  disabled={value.includes('.')}
                  className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 rounded transition"
                >
                  {key}
                </button>
              );
            }

            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="bg-white hover:bg-gray-200 border border-gray-300 text-gray-800 font-bold py-2 rounded transition text-lg"
              >
                {key}
              </button>
            );
          })}
        </React.Fragment>
      ))}

      {/* CLEAR BUTTON - spans 3 columns */}
      <button
        onClick={handleClear}
        className="col-span-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition mt-2"
      >
        Limpiar
      </button>

      {/* CLOSE BUTTON - if provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="col-span-3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded transition mt-2"
        >
          Cerrar
        </button>
      )}
    </div>
  );
};

export default NumericKeypad;
