import React, { useState } from 'react';
import { Send, Save, ArrowRight } from 'lucide-react';
import { AccountingTransaction, User } from '../../types.ts';

interface HawalaViewProps {
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateBalance: (usdChange: number, iqdChange: number) => void;
  t: (key: string) => string;
  currentUser: User | null;
}

const HawalaView: React.FC<HawalaViewProps> = ({ onAddTransaction, onUpdateBalance, t, currentUser }) => {
  const [type, setType] = useState<'send' | 'receive'>('send');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'IQD' | 'GBP' | 'EUR' | 'TRY' | 'SAR' | 'AED'>('USD');
  const [profit, setProfit] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const numAmount = parseFloat(amount) || 0;
  const numProfit = parseFloat(profit) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || !senderName || !receiverName) return;

    const tx: AccountingTransaction = {
      id: Date.now().toString(),
      type: type === 'send' ? 'hawala_send' : 'hawala_receive',
      amount: numAmount,
      currency,
      senderName,
      receiverName,
      destination,
      note,
      profit: numProfit,
      status: 'pending',
      date: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    onAddTransaction(tx);

    // Update balances
    if (type === 'send') {
      onUpdateBalance(currency === 'USD' ? -numAmount : 0, currency === 'IQD' ? -numAmount : 0);
    } else {
      onUpdateBalance(currency === 'USD' ? numAmount : 0, currency === 'IQD' ? numAmount : 0);
    }

    // Reset form
    setAmount('');
    setProfit('');
    setSenderName('');
    setReceiverName('');
    setDestination('');
    setNote('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Send className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('hawala') || 'حەواڵە'}</h2>
            <p className="text-xs text-slate-500">{t('send_receive_money') || 'ناردن یان وەرگرتنی پارە'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('send')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === 'send' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <ArrowRight size={16} /> {t('send') || 'ناردن'}
            </button>
            <button
              type="button"
              onClick={() => setType('receive')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === 'receive' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Send size={16} className="rotate-180" /> {t('receive') || 'وەرگرتن'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('amount') || 'بڕ'}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('profit') || 'قازانج'}</label>
              <input
                type="number"
                value={profit}
                onChange={(e) => setProfit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('currency') || 'دراو'}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="IQD">IQD (د.ع)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('sender_name') || 'ناوی نێرەر'}</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder={t('sender_name_placeholder') || 'ناوی نێرەر...'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('receiver_name') || 'ناوی وەرگر'}</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder={t('receiver_name_placeholder') || 'ناوی وەرگر...'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('destination') || 'شوێنی مەبەست'}</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
              placeholder={t('destination_placeholder') || 'نموونە: دوبەی، ئەستەنبوڵ، هەولێر'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('note_optional') || 'تێبینی (ئارەزوومەندانە)'}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
              placeholder={t('note_placeholder') || 'زانیاری زیاتر...'}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={18} />
            {t('save_hawala') || 'پاشەکەوتکردنی حەواڵە'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HawalaView;
