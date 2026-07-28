'use client';
import React, { useState } from 'react';

const FONTS = [
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Lora', family: 'Lora, serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { name: 'Ubuntu', family: 'Ubuntu, sans-serif' },
];

const FontSelector = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600">Choose Application Font</h2>
          <button onClick={onClose} className="text-red-600 hover:text-red-800 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
          {FONTS.map((font) => (
            <div 
              key={font.name} 
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 cursor-pointer transition-all group"
              onClick={() => {
                document.body.style.fontFamily = font.family;
                onClose();
              }}
            >
              <span className="block text-xs text-red-600 mb-1">{font.name}</span>
              <p style={{ fontFamily: font.family }} className="text-lg text-red-600">
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-red-600">
          Click on a sample to apply the font to the entire app.
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
