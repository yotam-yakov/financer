'use client';
import React, { useState, useEffect } from 'react';

const RenameUserModal = ({ isOpen, onClose, onConfirm, currentName }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (currentName) {
      setName(currentName);
    }
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === currentName) {
      onClose();
      return;
    }
    onConfirm(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Rename User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New User Name</label>
            <input 
              type="text"
              className="w-full border border-slate-600 rounded-md p-2 text-white bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-slate-700 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Rename User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameUserModal;
