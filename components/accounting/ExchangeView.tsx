import React, { useState } from 'react';
import { ArrowRightLeft, Calculator, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { AccountingTransaction, User } from '../../types.ts';

interface ExchangeViewProps {
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateBalance: (usdChange: number, iqdChange: number, tomanChange?: number) => void;
  t: (key: string) => string;
  currentUser: User | null;
}

const ExchangeView: React.FC<ExchangeViewProps> = ({ onAddTransaction, onUpdateBalance, t, currentUser }) => {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'IQD' | 'TOMAN'>('USD');
  const [toCurrency, setToCurrency] = useState<'USD' | 'IQD' | 'TOMAN'>('IQD');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('1500');
  const [clientName, setClientName] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(rate) || 0;
  
  // Calculation logic based on currency pair
  const calculateConverted = () => {
    if (fromCurrency === 'USD' && toCurrency === 'IQD') return numAmount * (numRate / 100);
    if (fromCurrency === 'IQD' && toCurrency === 'USD') return numAmount / (numRate / 100);
    if (fromCurrency === 'USD' && toCurrency === 'TOMAN') return numAmount * numRate;
    if (fromCurrency === 'TOMAN' && toCurrency === 'USD') return numAmount / numRate;
    if (fromCurrency === 'IQD' && toCurrency === 'TOMAN') return (numAmount / 1500) * numRate; // Rough estimate
    return numAmount;
  };

  const totalConverted = calculateConverted();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || !numRate) return;

    const tx: AccountingTransaction = {
      id: Date.now().toString(),
      type: type === 'buy' ? 'exchange_buy' : 'exchange_sell',
      amount: numAmount,
      currency: fromCurrency,
      targetCurrency: toCurrency,
      rate: numRate,
      totalConverted,
      clientName,
      note,
      status: 'completed',
      date: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    onAddTransaction(tx);

    // Update balances based on from/to
    const usdChange = fromCurrency === 'USD' ? -numAmount : (toCurrency === 'USD' ? totalConverted : 0);
    const iqdChange = fromCurrency === 'IQD' ? -numAmount : (toCurrency === 'IQD' ? totalConverted : 0);
    const tomanChange = fromCurrency === 'TOMAN' ? -numAmount : (toCurrency === 'TOMAN' ? totalConverted : 0);

    onUpdateBalance(usdChange, iqdChange, tomanChange);

    // Reset form
    setAmount('');
    setClientName('');
    setNote('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowRightLeft className="text-emerald-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('currency_exchange')}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('exchange_desc')}</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('buy')}
              className={`px-6 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                type === 'buy' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-lg' : 'text-slate-500'
              }`}
            >
              <TrendingUp size={14} />
              {t('buy').toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setType('sell')}
              className={`px-6 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                type === 'sell' ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-lg' : 'text-slate-500'
              }`}
            >
              <TrendingDown size={14} />
              {t('sell').toUpperCase()}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('from_currency')}</label>
              <select 
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="USD">USD - Dollar</option>
                <option value="IQD">IQD - Dinar</option>
                <option value="TOMAN">TOMAN - {t('toman')}</option>
              </select>
            </div>

            <div className="flex items-center justify-center pt-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ArrowRightLeft size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('to_currency')}</label>
              <select 
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="USD">USD - Dollar</option>
                <option value="IQD">IQD - Dinar</option>
                <option value="TOMAN">TOMAN - {t('toman')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('amount_exchange')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-xl text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">{fromCurrency}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('exchange_rate')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-xl text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-primary outline-none"
                  placeholder="1500"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">{t('rate').toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Calculation Result Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Calculator size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{t('receive_amount')}</p>
                <p className="text-2xl font-black text-primary">
                  {totalConverted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}
                </p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('market_price_estimate')}</p>
              <p className="text-xs font-bold text-slate-500">{t('market_note')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('client_name')}</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder={t('customer_name_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('note_reference')}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder={t('details_transaction')}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-primary/20"
          >
            <Save size={20} />
            {t('confirm_transaction').toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExchangeView;
