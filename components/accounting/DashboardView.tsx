import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, History, ArrowRightLeft, Plus, Wallet, Coins } from 'lucide-react';
import { AccountingBalance, AccountingTransaction, AccountingClient } from '../../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  balance: AccountingBalance;
  transactions: AccountingTransaction[];
  clients: AccountingClient[];
  t: (key: string) => string;
  onUpdateFullBalance: (newBalance: AccountingBalance) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ balance, transactions, clients, t, onUpdateFullBalance }) => {
  const [showSetCapital, setShowSetCapital] = useState(false);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  
  const [editBalance, setEditBalance] = useState({
    usd: balance.usd.toString(),
    iqd: balance.iqd.toString(),
    toman: (balance.toman || 0).toString()
  });

  const [newCurrency, setNewCurrency] = useState({ name: '', amount: '' });

  // Calculate summary metrics
  const totalExpensesUSD = transactions
    .filter(tx => tx.type === 'expense' && tx.currency === 'USD')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpensesIQD = transactions
    .filter(tx => tx.type === 'expense' && tx.currency === 'IQD')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const hawalaCount = transactions.filter(tx => tx.type.includes('hawala')).length;
  const exchangeCount = transactions.filter(tx => tx.type.includes('exchange')).length;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayTxs = transactions.filter(tx => tx.date.startsWith(date));
    const volumeUSD = dayTxs.reduce((sum, tx) => tx.currency === 'USD' ? sum + tx.amount : sum, 0);
    const volumeIQD = dayTxs.reduce((sum, tx) => tx.currency === 'IQD' ? sum + tx.amount : sum, 0);
    
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      usd: volumeUSD,
      iqd: volumeIQD / 1500 // Rough conversion for chart scaling
    };
  });

  const handleSaveCapital = () => {
    const updated: AccountingBalance = {
      ...balance,
      usd: parseFloat(editBalance.usd) || 0,
      iqd: parseFloat(editBalance.iqd) || 0,
      toman: parseFloat(editBalance.toman) || 0,
      lastUpdated: new Date().toISOString()
    };
    onUpdateFullBalance(updated);
    setShowSetCapital(false);
  };

  const handleAddCurrency = () => {
    if (!newCurrency.name || !newCurrency.amount) return;
    
    const updated: AccountingBalance = {
      ...balance,
      extraCurrencies: {
        ...(balance.extraCurrencies || {}),
        [newCurrency.name.toUpperCase()]: parseFloat(newCurrency.amount) || 0
      },
      lastUpdated: new Date().toISOString()
    };
    onUpdateFullBalance(updated);
    setNewCurrency({ name: '', amount: '' });
    setShowAddCurrency(false);
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign size={120} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{t('total_usd')}</p>
          <h2 className="text-3xl font-black tracking-tight">${balance.usd.toLocaleString()}</h2>
        </div>
        
        <div className="bg-sky-500 p-6 rounded-[2rem] text-white shadow-xl shadow-sky-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <Coins size={120} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{t('total_iqd')}</p>
          <h2 className="text-3xl font-black tracking-tight">IQD {balance.iqd.toLocaleString()}</h2>
        </div>

        <div className="bg-orange-500 p-6 rounded-[2rem] text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={120} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{t('total_toman')}</p>
          <h2 className="text-3xl font-black tracking-tight">{(balance.toman || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Extra Currencies */}
      {balance.extraCurrencies && Object.keys(balance.extraCurrencies).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(balance.extraCurrencies).map(([code, amount]) => (
            <div key={code} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">{code}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => setShowSetCapital(!showSetCapital)}
          className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
        >
          <Wallet size={18} />
          {t('set_capital').toUpperCase()}
        </button>
        <button 
          onClick={() => setShowAddCurrency(!showAddCurrency)}
          className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          {t('add_new_currency').toUpperCase()}
        </button>
      </div>

      <AnimatePresence>
        {showSetCapital && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">USD</label>
                <input 
                  type="number"
                  value={editBalance.usd}
                  onChange={(e) => setEditBalance({...editBalance, usd: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IQD</label>
                <input 
                  type="number"
                  value={editBalance.iqd}
                  onChange={(e) => setEditBalance({...editBalance, iqd: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TOMAN</label>
                <input 
                  type="number"
                  value={editBalance.toman}
                  onChange={(e) => setEditBalance({...editBalance, toman: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveCapital}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20"
            >
              {t('update_balance').toUpperCase()}
            </button>
          </motion.div>
        )}

        {showAddCurrency && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('currency_name')}</label>
                <input 
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                  placeholder="e.g. EUR, TRY"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('initial_balance')}</label>
                <input 
                  type="number"
                  value={newCurrency.amount}
                  onChange={(e) => setNewCurrency({...newCurrency, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button 
              onClick={handleAddCurrency}
              className="w-full bg-primary text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-primary/20"
            >
              {t('add_new_currency').toUpperCase()}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('expenses_usd')}</h3>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">${totalExpensesUSD.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('expenses_iqd')}</h3>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">IQD {totalExpensesIQD.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('hawala_count')}</h3>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{hawalaCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('exchange_count')}</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{exchangeCount}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          {t('transaction_volume_7d')}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIqd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="usd" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsd)" name="USD Volume" />
              <Area type="monotone" dataKey="iqd" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorIqd)" name="IQD Volume (Scaled)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History size={18} className="text-primary" />
          {t('recent_activity')}
        </h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">{t('no_recent_activity')}</div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type.includes('buy') ? 'bg-emerald-100 text-emerald-600' :
                    tx.type.includes('sell') ? 'bg-sky-100 text-sky-600' :
                    tx.type.includes('hawala') ? 'bg-indigo-100 text-indigo-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    {tx.type === 'expense' ? <ArrowDownRight size={18} /> : <ArrowRightLeft size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'expense' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'expense' ? '-' : ''}{tx.amount.toLocaleString()} {tx.currency}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
