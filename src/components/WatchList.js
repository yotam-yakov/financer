'use client';

import React, { useState, useEffect } from 'react';

const WatchList = ({ user }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/watchlist?action=watchlist');
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      setStocks(data.stocks || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current prices for all stocks in the watchlist
  const fetchCurrentPrices = async () => {
    if (stocks.length === 0) return;

    try {
      const tickerList = stocks.map((stock) => stock.ticker).join(',');
      console.log('Fetching prices for tickers:', tickerList);
      const response = await fetch(`/api/stocks/current?tickers=${tickerList}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const priceData = await response.json();
      console.log('Received price data:', priceData);

      // Update stocks with current prices
      setStocks((prevStocks) => {
        return prevStocks.map((stock) => {
          if (priceData[stock.ticker]) {
            console.log(
              `Updating ${stock.ticker} with new prices:`,
              priceData[stock.ticker],
            );
            return {
              ...stock,
              currentPrice: priceData[stock.ticker].currentPrice,
              previousClose: priceData[stock.ticker].previousClose,
            };
          }
          return stock;
        });
      });
    } catch (err) {
      console.error('Error fetching current prices:', err);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    // Set up interval to update prices every 60 seconds
    const interval = setInterval(() => {
      console.log('Updating watchlist prices...');
      fetchCurrentPrices();
    }, 60000); // 60 seconds

    // Clean up interval on component unmount
    return () => {
      console.log('Clearing watchlist interval');
      clearInterval(interval);
    };
  }, []);

  const handleAddStock = async (ticker) => {
    try {
      const response = await fetch('/api/watchlist?action=add-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add stock to watchlist');
      }

      await fetchWatchlist(); // Refresh the list
    } catch (err) {
      setError(err.message);
      console.error('Error adding stock:', err);
    }
  };

  const handleRemoveStock = async (ticker) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-watchlist',
          ticker: ticker.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to remove stock from watchlist',
        );
      }

      await fetchWatchlist(); // Refresh the list
    } catch (err) {
      setError(err.message);
      console.error('Error removing stock:', err);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newTicker.trim()) {
      handleAddStock(newTicker.trim());
      setNewTicker('');
      setShowAddModal(false);
    }
  };

  const safeFixed = (val) =>
    typeof val === 'number' && !isNaN(val) ? val.toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className='mb-8 rounded-lg shadow overflow-hidden max-w-3xl mx-auto w-full bg-[#1e293b] p-6'>
        <div className='text-center text-gray-400'>Loading watchlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='mb-8 rounded-lg shadow overflow-hidden max-w-3xl mx-auto w-full bg-[#1e293b] p-6'>
        <div className='text-center text-red-400'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className='mb-8 rounded-lg shadow overflow-hidden max-w-3xl mx-auto w-full bg-[#1e293b]'>
      <div className='px-4 py-2 border-b border-slate-700 flex justify-between items-center bg-[#1e293b] opacity-90'>
        <h2 className='text-xl font-semibold text-gray-100'>
          Universal Watchlist
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium'
        >
          + Add Stock
        </button>
      </div>

      {stocks.length === 0 ? (
        <div className='p-6 text-center text-gray-400'>
          No stocks in watchlist. Click "Add Stock" to get started.
        </div>
      ) : (
        <table className='min-w-full divide-y divide-slate-700'>
          <thead className='bg-slate-800'>
            <tr>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Ticker
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Price Change
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Current Price
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-700'>
            {stocks.map((stock, index) => {
              const currentPrice = stock.currentPrice || 0;
              const previousPrice = stock.previousClose || currentPrice;
              const priceChange = currentPrice - previousPrice;
              const priceChangePercent =
                previousPrice !== 0
                  ? ((currentPrice - previousPrice) / previousPrice) * 100
                  : 0;

              const isPositive = priceChange >= 0;

              return (
                <tr key={index} className='text-gray-100'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                    {stock.ticker}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${isPositive ? 'text-green-400' : 'text-red-400'} font-medium text-center`}
                  >
                    {isPositive ? '▲' : '▼'}{' '}
                    {safeFixed(Math.abs(priceChangePercent))}%
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center'>
                    ${safeFixed(currentPrice)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-center'>
                    <button
                      onClick={() => handleRemoveStock(stock.ticker)}
                      className='px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-100'>
                Add Stock to Watchlist
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className='text-gray-400 hover:text-gray-200 text-2xl'
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>
                  Stock Ticker
                </label>
                <input
                  type='text'
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  placeholder='Enter stock ticker (e.g. AAPL)'
                  className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>

              <div className='flex justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                >
                  Add to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchList;
