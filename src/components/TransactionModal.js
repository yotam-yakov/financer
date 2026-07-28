'use client';
import React, { useState } from 'react';

const COMMON_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'BABA', 'V', 'JPM', 'WMT', 'PG'];

const TransactionModal = ({ isOpen, onClose, onConfirm, type, user, holdings }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    shares: '',
    price: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure we don't submit empty or invalid data
    if (!formData.ticker || !formData.shares || !formData.price) return;
    
    onConfirm({ 
      ...formData, 
      shares: parseFloat(formData.shares), 
      price: parseFloat(formData.price) 
    });
    
    setFormData({ ticker: '', shares: '', price: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">
          {type === 'buy' ? 'Buy Stock' : 'Sell Stock'} for {user}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Ticker</label>
            {type === 'sell' ? (
              <select 
                className="mt-1 block w-full border border-slate-600 rounded-md p-2 text-white bg-slate-700"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                required
              >
                <option value="" className="bg-slate-700">Select a stock to sell</option>
                {holdings.map(h => (
                  <option key={h.ticker} value={h.ticker} className="bg-slate-700">{h.ticker} ({h.shares} shares)</option>
                ))}
              </select>
            ) : (
              <>
                <input 
                  type="text"
                  list="ticker-suggestions"
                  className="mt-1 block w-full border border-slate-600 rounded-md p-2 uppercase text-white bg-slate-700"
                  placeholder="e.g. NVDA"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  required
                />
                <datalist id="ticker-suggestions">
                  {COMMON_TICKERS.map(ticker => (
                    <option key={ticker} value={ticker} />
                  ))}
                </datalist>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Shares</label>
              <input 
                type="number" 
                step="any"
                className="mt-1 block w-full border border-slate-600 rounded-md p-2 text-white bg-slate-700"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Price ($)</label>
              <input 
                type="number" 
                step="any"
                className="mt-1 block w-full border border-slate-600 rounded-md p-2 text-white bg-slate-700"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-slate-700 rounded-md font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-4 py-2 text-white rounded-md font-medium ${type === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Confirm {type === 'buy' ? 'Purchase' : 'Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
