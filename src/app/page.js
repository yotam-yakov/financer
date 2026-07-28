'use client';
import React, { useState, useEffect } from 'react';
import HoldingsTable from '@/components/HoldingsTable';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import TransactionHistory from '@/components/TransactionHistory';
import TransactionModal from '@/components/TransactionModal';
import UserModal from '@/components/UserModal';
import DeleteUserModal from '@/components/DeleteUserModal';
import RenameUserModal from '@/components/RenameUserModal';

export default function PortfolioPage() {
  const [authLevel, setAuthLevel] = useState('none'); // 'none' | 'admin' | 'viewer'
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('all');
  const [holdings, setHoldings] = useState([]);
  const [prices, setPrices] = useState({});
  const [conversionRate, setConversionRate] = useState(3.7);
  const [history, setHistory] = useState([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToRename, setUserToRename] = useState(null);
  const [transactionType, setTransactionType] = useState('buy');

  useEffect(() => {
    const savedAuth = localStorage.getItem('financer_auth_level');
    if (savedAuth) {
      setAuthLevel(savedAuth);
    }
  }, []);

  useEffect(() => {
    if (authLevel !== 'none') {
      fetchUsers();
    }
  }, [authLevel]);

  useEffect(() => {
    if (authLevel !== 'none') {
      fetchData();
    }
  }, [user, authLevel]);

  async function handleLogin(e) {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuthLevel(data.role);
        localStorage.setItem('financer_auth_level', data.role);
      } else {
        setAuthError('Invalid password');
      }
    } catch (error) {
      setAuthError('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async function fetchData() {
    try {
      // Fetch holdings for the user
      const holdingsRes = await fetch(`/api/users?user=${user}`);
      if (!holdingsRes.ok) throw new Error('Failed to fetch holdings');
      const holdingsData = await holdingsRes.json();

      // Enrich holdings with latest prices
      const tickers = holdingsData.map(h => h.ticker).join(',');
      const pricesRes = await fetch(`/api/stocks?tickers=${tickers}`);
      if (pricesRes.ok) {
        const pricesData = await pricesRes.json();
        const enrichedHoldings = holdingsData.map(h => ({
          ...h,
          currentPrice: pricesData[h.ticker]?.currentPrice || h.currentPrice,
          previousPrice: pricesData[h.ticker]?.previousClose || h.previousPrice
        }));
        setHoldings(enrichedHoldings);
      } else {
        setHoldings(holdingsData);
      }

      // Fetch total earnings and conversion rate
      const totalRes = await fetch(`/api/users?user=${user}&action=total`);
      if (totalRes.ok) {
        const totalData = await totalRes.json();
        setConversionRate(totalData.conversionRate);
      }

      // Fetch history for realized earnings calculation
      const historyRes = await fetch(`/api/users?user=${user}&action=history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const fetchHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleBuy = () => {
    setTransactionType('buy');
    setIsTransactionModalOpen(true);
  };

  const handleSell = () => {
    setTransactionType('sell');
    setIsTransactionModalOpen(true);
  };

  const handleTransactionConfirm = async (transaction) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          type: transactionType,
          ...transaction
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Transaction failed');
      }

      await fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddUser = async (name) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      // Update local users list and switch to the new user
      await fetchUsers();
      setUser(name);
      setIsUserModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = (username) => {
    setUserToDelete(username);
    setIsDeleteModalOpen(true);
  };

  const handleRenameUser = (username) => {
    setUserToRename(username);
    setIsRenameModalOpen(true);
  };

  const confirmRenameUser = async (newName) => {
    if (!userToRename) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName: userToRename, newName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to rename user');
      }

      if (user === userToRename) {
        setUser(newName);
      }
      await fetchUsers();
      setIsRenameModalOpen(false);
      setUserToRename(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // IMPORTANT: Set user to 'all' BEFORE deleting to avoid 
      // the useEffect(fetchData) crashing when the current user is gone.
      setUser('all');

      const res = await fetch(`/api/users?user=${userToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      alert(error.message);
      setIsDeleteModalOpen(false);
    }
  };

  const getChartData = () => {
    const tickerMap = {};

    if (user === 'all') {
      holdings.forEach(h => {
        const value = h.shares * h.currentPrice;
        if (!tickerMap[h.ticker]) {
          tickerMap[h.ticker] = { 
            ticker: h.ticker, 
            value: 0, 
            userHoldings: [] 
          };
        }
        tickerMap[h.ticker].value += value;
      });
    } else {
      holdings.forEach(h => {
        const value = h.shares * h.currentPrice;
        if (!tickerMap[h.ticker]) {
          tickerMap[h.ticker] = { 
            ticker: h.ticker, 
            value: 0, 
            userHoldings: [] 
          };
        }
        tickerMap[h.ticker].value += value;
        tickerMap[h.ticker].userHoldings.push({ user, value });
      });
    }
    return Object.values(tickerMap);
  };

  if (authLevel === 'none') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              Financer
            </h1>
            <p className="text-slate-400 text-sm">Please enter your access key to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {authError && (
              <p className="text-red-400 text-center text-sm font-medium">
                {authError}
              </p>
            )}

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              {isAuthenticating ? 'Verifying...' : 'Enter Portfolio'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const canEdit = authLevel === 'admin';

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto relative">
      <div className="fixed top-4 right-4 z-50 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-3 py-1 rounded-full text-xs font-mono text-slate-400 shadow-sm">
        USD/ILS: <span className="text-blue-400 font-bold">{typeof conversionRate === 'number' ? conversionRate.toFixed(4) : '---'}</span>
      </div>

      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Financer
        </h1>
        <button 
          onClick={() => {
            localStorage.removeItem('financer_auth_level');
            setAuthLevel('none');
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setUser('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  user === 'all' 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                All Users
              </button>
              {users.map(u => (
                <div key={u} className="flex items-center gap-1">
                  <button 
                    onClick={() => setUser(u)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      user === u 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                </div>
              ))}
            </div>

            {canEdit && (
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm border border-emerald-500"
              >
                + Add User
              </button>
            )}
          </div>
          <HoldingsTable 
            user={user}
            holdings={holdings}
            history={history}
            conversionRate={conversionRate}
            onRefresh={fetchData}
            onBuy={canEdit && (user === 'all' ? null : handleBuy)}
            onSell={canEdit && (user === 'all' ? null : handleSell)}
            onHistory={fetchHistory}
            onRename={canEdit && (user !== 'all' ? () => handleRenameUser(user) : null)}
            onDelete={canEdit && (user !== 'all' ? () => handleDeleteUser(user) : null)}
          />
        </div>
        <div className="lg:col-span-5">
          <PortfolioPieChart data={getChartData()} />
        </div>
      </div>



      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onConfirm={handleAddUser} 
      />

      <RenameUserModal 
        isOpen={isRenameModalOpen} 
        onClose={() => setIsRenameModalOpen(false)} 
        onConfirm={confirmRenameUser} 
        currentName={userToRename} 
      />

      <DeleteUserModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDeleteUser} 
        username={userToDelete} 
      />

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        onConfirm={handleTransactionConfirm} 
        type={transactionType} 
        user={user} 
        holdings={holdings} 
      />

      <TransactionHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
      />
    </main>
  );
}

