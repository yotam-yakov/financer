'use client';
import React from 'react';

const TransactionHistory = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-100">Transaction History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No transactions yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Ticker</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Shares</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Earnings/Loss</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {history.map((tx, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{tx.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-400">{tx.user}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-100">{tx.ticker}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{Number(tx.shares).toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">${tx.price.toFixed(2)}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${tx.earnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.earnings !== null ? `${tx.earnings >= 0 ? '+' : ''}$${tx.earnings.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
