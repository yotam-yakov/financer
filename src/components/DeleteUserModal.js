'use client';
import React from 'react';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, username }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-900/30 rounded-full">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Delete User</h2>
        </div>
        
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <span className="text-white font-bold">{username}</span>? 
          This action will permanently remove all their holdings and transaction history. This cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm border border-red-500"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
