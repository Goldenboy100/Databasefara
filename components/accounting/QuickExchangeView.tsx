import React, { useState } from 'react';
import { Zap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AccountingTransaction, User } from '../../types.ts';

interface QuickExchangeViewProps {
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateBalance: (usdChange: number, iqdChange: number, tomanChange?: number) => void;
  t: (key: string) => string;
  currentUser: User | null;
}

const QuickExchangeView: React.FC<QuickExchangeViewProps> = ({ onAddTransaction, onUpdateBalance, t, currentUser }) => {
  const [buyRateIQD, setBuyRateIQD] = useState<string>('154000'); // Rate per $100
  const [sellRateIQD, setSellRateIQD] = useState<string>('155000'); // Rate per $100
  
  const [buyRateToman, setBuyRateToman] = useState<string>('6000000'); // Rate per $100
  const [sellRateToman, setSellRateToman] = useState<string>('6100000'); // Rate per $100

  const [profitPer100IQD, setProfitPer100IQD] = useState<string>('1000');
  const [profitPer100Toman, setProfitPer100Toman] = useState<string>('50000');

  const handleQuickExchange = (type: 'buy' | 'sell', amountUSD: number, targetCurrency: 'IQD' | 'TOMAN') => {
    let rateStr = '0';
    let profitPer100Str = '0';

    if (targetCurrency === 'IQD') {
      rateStr = type === 'buy' ? buyRateIQD : sellRateIQD;
      profitPer100Str = profitPer100IQD;
    } else {
      rateStr = type === 'buy' ? buyRateToman : sellRateToman;
      profitPer100Str = profitPer100Toman;
    }

    const rate = parseFloat(rateStr) / 100;
    const profitPer100 = parseFloat(profitPer100Str) || 0;

    if (!rate || isNaN(rate)) {
      alert(t('invalid_rate') || 'Please enter a valid exchange rate.');
      return;
    }

    const totalConverted = amountUSD * rate;
    const profit = (amountUSD / 100) * profitPer100;

    const tx: AccountingTransaction = {
      id: Date.now().toString(),
      type: type === 'buy' ? 'exchange_buy' : 'exchange_sell',
      amount: amountUSD,
      currency: 'USD',
      targetCurrency: targetCurrency,
      rate: rate,
      totalConverted,
      profit: profit,
      clientName: 'Quick Exchange',
      note: `Quick ${type} $${amountUSD} for ${targetCurrency}`,
      status: 'completed',
      date: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    onAddTransaction(tx);

    // If I BUY USD, I gain USD and lose IQD/TOMAN
    // If I SELL USD, I lose USD and gain IQD/TOMAN
    const usdChange = type === 'buy' ? amountUSD : -amountUSD;
    const iqdChange = targetCurrency === 'IQD' ? (type === 'buy' ? -totalConverted : totalConverted) : 0;
    const tomanChange = targetCurrency === 'TOMAN' ? (type === 'buy' ? -totalConverted : totalConverted) : 0;

    onUpdateBalance(usdChange, iqdChange, tomanChange);
  };

  const usdAmounts = [100, 500, 1000, 15000];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Rates Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col gap-6">
        
          {/* IQD Rates */}
          <div className="flex flex-col md:flex-row gap-6 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="w-full md:w-1/4">
              <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">IQD</span>
                {t('iqd_rate') || 'IQD Rates'}
              </h4>
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={14} /> {t('buy_rate') || 'Buy'}
              </label>
              <input
                type="number"
                value={buyRateIQD}
                onChange={(e) => setBuyRateIQD(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingDown size={14} /> {t('sell_rate') || 'Sell'}
              </label>
              <input
                type="number"
                value={sellRateIQD}
                onChange={(e) => setSellRateIQD(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <DollarSign size={14} /> {t('profit_per_100') || 'Profit/$100'}
              </label>
              <input
                type="number"
                value={profitPer100IQD}
                onChange={(e) => setProfitPer100IQD(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Toman Rates */}
          <div className="flex flex-col md:flex-row gap-6 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="w-full md:w-1/4">
              <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">TOM</span>
                {t('toman_rate') || 'Toman Rates'}
              </h4>
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={14} /> {t('buy_rate') || 'Buy'}
              </label>
              <input
                type="number"
                value={buyRateToman}
                onChange={(e) => setBuyRateToman(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingDown size={14} /> {t('sell_rate') || 'Sell'}
              </label>
              <input
                type="number"
                value={sellRateToman}
                onChange={(e) => setSellRateToman(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div className="w-full md:w-1/4 space-y-2">
              <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <DollarSign size={14} /> {t('profit_per_100') || 'Profit/$100'}
              </label>
              <input
                type="number"
                value={profitPer100Toman}
                onChange={(e) => setProfitPer100Toman(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USD <-> IQD Quick Exchange */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Zap className="text-sky-500" size={20} />
            </div>
            <h3 className="text-lg font-black dark:text-white">USD ↔ IQD</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {usdAmounts.map(amount => {
              const bRate = parseFloat(buyRateIQD) / 100 || 0;
              const sRate = parseFloat(sellRateIQD) / 100 || 0;
              const profitPer100 = parseFloat(profitPer100IQD) || 0;
              const totalProfit = (amount / 100) * profitPer100;
              
              return (
              <div key={`iqd-${amount}`} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
                <div className="text-center font-black text-xl text-slate-900 dark:text-white">${amount.toLocaleString()}</div>
                <div className="text-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 py-1 rounded-lg">
                  {t('profit') || 'قازانج'}: {totalProfit.toLocaleString()} IQD
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => handleQuickExchange('buy', amount, 'IQD')}
                    className="py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp size={12} /> {t('buy') || 'Buy'}
                  </button>
                  <button
                    onClick={() => handleQuickExchange('sell', amount, 'IQD')}
                    className="py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingDown size={12} /> {t('sell') || 'Sell'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* USD <-> TOMAN Quick Exchange */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap className="text-amber-500" size={20} />
            </div>
            <h3 className="text-lg font-black dark:text-white">USD ↔ TOMAN</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {usdAmounts.map(amount => {
              const bRate = parseFloat(buyRateToman) / 100 || 0;
              const sRate = parseFloat(sellRateToman) / 100 || 0;
              const profitPer100 = parseFloat(profitPer100Toman) || 0;
              const totalProfit = (amount / 100) * profitPer100;
              
              return (
              <div key={`toman-${amount}`} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
                <div className="text-center font-black text-xl text-slate-900 dark:text-white">${amount.toLocaleString()}</div>
                <div className="text-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 py-1 rounded-lg">
                  {t('profit') || 'قازانج'}: {totalProfit.toLocaleString()} TOMAN
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => handleQuickExchange('buy', amount, 'TOMAN')}
                    className="py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp size={12} /> {t('buy') || 'Buy'}
                  </button>
                  <button
                    onClick={() => handleQuickExchange('sell', amount, 'TOMAN')}
                    className="py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingDown size={12} /> {t('sell') || 'Sell'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickExchangeView;
