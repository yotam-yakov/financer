import React from 'react';

const HoldingsTable = ({ user, holdings, history = [], conversionRate, onRefresh, onBuy, onSell, onHistory, onRename, onDelete }) => {
  const safeFixed = (val) => (typeof val === 'number' && !isNaN(val) ? val.toFixed(2) : '0.00');
  
  const totalUSD = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || 0)), 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + (h.shares * (h.avgPrice || 0)), 0);
  const totalEarnings = totalUSD - totalCostBasis;
  const totalNIS = totalUSD * (conversionRate || 3.7);

  const realizedEarnings = history.reduce((sum, tx) => {
    if (tx.type === 'sell' && tx.earnings != null) {
      return sum + tx.earnings;
    }
    return sum;
  }, 0);

  return (
    <div className="mb-8 rounded-lg shadow overflow-hidden max-w-3xl mx-auto w-full bg-[#1e293b]">
      <div className="px-4 py-2 border-b border-slate-700 flex justify-between items-center bg-[#1e293b] opacity-90">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-100">{user}'s Holdings</h2>
          <div className="flex gap-1">
            {onRename && (
              <button 
                onClick={onRename}
                className="p-1 text-xs text-gray-500 hover:text-blue-400 transition-colors opacity-70 hover:opacity-100"
                title="Rename User"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1 text-xs text-gray-500 hover:text-red-400 transition-colors opacity-70 hover:opacity-100"
                title="Delete User"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
              title="Refresh Data"
            >
              🔄
            </button>
          )}
          <button 
            onClick={onHistory}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
            title="Transaction History"
          >
            🕒
          </button>
          {onBuy && (
            <button 
              onClick={onBuy}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Buy
            </button>
          )}
          {onSell && (
            <button 
              onClick={onSell}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Sell
            </button>
          )}
        </div>
      </div>
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ticker
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Shares
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Price Change
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Current Price
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Market Value
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Earnings
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {holdings.map((holding, index) => {
            const currentPrice = holding.currentPrice || 0;
            const previousPrice = holding.previousPrice || currentPrice;
            const marketValue = holding.shares * currentPrice;
            const costBasis = holding.shares * (holding.avgPrice || 0);
            const earnings = marketValue - costBasis;
            const prevMarketValue = holding.shares * previousPrice;
            const dayChange = marketValue - prevMarketValue;
            const priceChangePercent = previousPrice !== 0 
              ? ((currentPrice - previousPrice) / previousPrice) * 100 
              : 0;
            
            const isPositive = dayChange >= 0;
            const isEarningsPositive = earnings >= 0;

            return (
              <tr key={index} className="text-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  {holding.ticker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">
                  {safeFixed(holding.shares)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isPositive ? 'text-green-400' : 'text-red-400'} font-medium text-center`}>
                  {isPositive ? '▲' : '▼'} {safeFixed(Math.abs(priceChangePercent))}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">
                  ${safeFixed(currentPrice)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'} text-center`}>
                  ${safeFixed(marketValue)} 
                  <span className={`ml-2 text-xs font-normal ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ({isPositive ? '+' : ''}{safeFixed(dayChange)})
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isEarningsPositive ? 'text-green-400' : 'text-red-400'} text-center`}>
                  {isEarningsPositive ? '+' : ''}${safeFixed(earnings)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 text-right flex flex-wrap justify-end gap-x-8 gap-y-2 items-center">
        <div className="text-sm text-gray-400">
          Total Value: <span className="text-lg font-bold text-gray-100">${safeFixed(totalUSD)}</span>
        </div>
        <div className="text-sm text-gray-400 border-l pl-6 border-slate-600">
          NIS Value: <span className="text-lg font-bold text-blue-400">₪{totalNIS.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        <div className="text-sm text-gray-400 border-l pl-6 border-slate-600">
          Total Earnings: <span className={`text-lg font-bold ${totalEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalEarnings >= 0 ? '+' : ''}${safeFixed(totalEarnings)}
          </span>
        </div>
        <div className="text-sm text-gray-400 border-l pl-6 border-slate-600">
          Realized (Past Sales): <span className={`text-lg font-bold ${realizedEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {realizedEarnings >= 0 ? '+' : ''}${safeFixed(realizedEarnings)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoldingsTable;
