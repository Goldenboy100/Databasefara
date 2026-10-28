import React, { useState } from 'react';
import { Receipt, Save, Tag } from 'lucide-react';
import { AccountingTransaction, User } from '../../types.ts';

interface ExpensesViewProps {
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateBalance: (usdChange: number, iqdChange: number) => void;
  t: (key: string) => string;
  currentUser: User | null;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ onAddTransaction, onUpdateBalance, t, currentUser }) => {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'IQD'>('USD');
  const [category, setCategory] = useState<string>('Office Supplies');
  const [note, setNote] = useState<string>('');

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || !category) return;

    const tx: AccountingTransaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: numAmount,
      currency,
      category,
      note,
      status: 'completed',
      date: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    onAddTransaction(tx);

    // Update balances (Expenses decrease balance)
    if (currency === 'USD') {
      onUpdateBalance(-numAmount, 0);
    } else {
      onUpdateBalance(0, -numAmount);
    }

    // Reset form
    setAmount('');
    setNote('');
  };

  const categories = [
    'Office Supplies',
    'Rent',
    'Utilities',
    'Salaries',
    'Marketing',
    'Travel',
    'Maintenance',
    'Other'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Receipt className="text-rose-600 dark:text-rose-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Record Expense</h2>
            <p className="text-xs text-slate-500">Track company operational costs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'IQD')}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="IQD">IQD (د.ع)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description / Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
              placeholder="What was this expense for?"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={18} />
            Record Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpensesView;
