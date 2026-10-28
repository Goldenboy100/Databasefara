import React, { useState, useMemo } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Activity, DollarSign, ArrowRightLeft, Send } from 'lucide-react';
import { AccountingTransaction, User } from '../../types.ts';

interface ReportsViewProps {
  transactions: AccountingTransaction[];
  t: (key: string) => string;
  currentUser: User | null;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, t, currentUser }) => {
  const [period, setPeriod] = useState<Period>('daily');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Sunday as start of week
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      switch (period) {
        case 'daily': return txDate >= startOfDay;
        case 'weekly': return txDate >= startOfWeek;
        case 'monthly': return txDate >= startOfMonth;
        case 'yearly': return txDate >= startOfYear;
        default: return true;
      }
    });
  }, [transactions, period]);

  const stats = useMemo(() => {
    let incomeUSD = 0, incomeIQD = 0, incomeTOMAN = 0, incomeGBP = 0, incomeEUR = 0, incomeTRY = 0, incomeSAR = 0, incomeAED = 0;
    let expenseUSD = 0, expenseIQD = 0, expenseTOMAN = 0, expenseGBP = 0, expenseEUR = 0, expenseTRY = 0, expenseSAR = 0, expenseAED = 0;
    let exchangeVolume = 0;
    let exchangeProfitIQD = 0;
    let exchangeProfitTOMAN = 0;
    let hawalaVolume = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        if (tx.currency === 'USD') incomeUSD += tx.amount;
        if (tx.currency === 'IQD') incomeIQD += tx.amount;
        if (tx.currency === 'TOMAN') incomeTOMAN += tx.amount;
        if (tx.currency === 'GBP') incomeGBP += tx.amount;
        if (tx.currency === 'EUR') incomeEUR += tx.amount;
        if (tx.currency === 'TRY') incomeTRY += tx.amount;
        if (tx.currency === 'SAR') incomeSAR += tx.amount;
        if (tx.currency === 'AED') incomeAED += tx.amount;
      } else if (tx.type === 'expense') {
        if (tx.currency === 'USD') expenseUSD += tx.amount;
        if (tx.currency === 'IQD') expenseIQD += tx.amount;
        if (tx.currency === 'TOMAN') expenseTOMAN += tx.amount;
        if (tx.currency === 'GBP') expenseGBP += tx.amount;
        if (tx.currency === 'EUR') expenseEUR += tx.amount;
        if (tx.currency === 'TRY') expenseTRY += tx.amount;
        if (tx.currency === 'SAR') expenseSAR += tx.amount;
        if (tx.currency === 'AED') expenseAED += tx.amount;
      } else if (tx.type === 'exchange_buy' || tx.type === 'exchange_sell') {
        exchangeVolume += tx.amount; // Assuming amount is the base currency volume
        if (tx.profit) {
          if (tx.targetCurrency === 'IQD') exchangeProfitIQD += tx.profit;
          if (tx.targetCurrency === 'TOMAN') exchangeProfitTOMAN += tx.profit;
        }
      } else if (tx.type === 'hawala_send' || tx.type === 'hawala_receive') {
        hawalaVolume += tx.amount;
      }
    });

    return {
      incomeUSD, incomeIQD, incomeTOMAN, incomeGBP, incomeEUR, incomeTRY, incomeSAR, incomeAED,
      expenseUSD, expenseIQD, expenseTOMAN, expenseGBP, expenseEUR, expenseTRY, expenseSAR, expenseAED,
      exchangeVolume, exchangeProfitIQD, exchangeProfitTOMAN, hawalaVolume,
      totalTx: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const periodLabels = {
    daily: t('daily_report') || 'Daily Report',
    weekly: t('weekly_report') || 'Weekly Report',
    monthly: t('monthly_report') || 'Monthly Report',
    yearly: t('yearly_report') || 'Yearly Report'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
      {/* Controls - Hidden when printing */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <FileText className="text-indigo-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports') || 'Reports'}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard') || 'Dashboard'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
          {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                period === p ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t(p) || p}
            </button>
          ))}
        </div>

        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30"
        >
          <Download size={16} /> {t('print_pdf') || 'Print / PDF'}
        </button>
      </div>

      {/* Printable Report Area */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
        
        <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{periodLabels[period]}</h1>
          <p className="text-sm font-bold text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-400">{t('account') || 'Account'}: {currentUser?.name || 'VIP User'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Income Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">{t('total_income') || 'Total Income'}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 dark:text-white">${stats.incomeUSD.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">IQD {stats.incomeIQD.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">TOMAN {stats.incomeTOMAN.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">GBP {stats.incomeGBP.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">EUR {stats.incomeEUR.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">TRY {stats.incomeTRY.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">SAR {stats.incomeSAR.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">AED {stats.incomeAED.toLocaleString()}</p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <TrendingDown size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">{t('total_expenses') || 'Total Expenses'}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 dark:text-white">${stats.expenseUSD.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">IQD {stats.expenseIQD.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">TOMAN {stats.expenseTOMAN.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">GBP {stats.expenseGBP.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">EUR {stats.expenseEUR.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">TRY {stats.expenseTRY.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">SAR {stats.expenseSAR.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">AED {stats.expenseAED.toLocaleString()}</p>
            </div>
          </div>

          {/* Exchange Volume & Profit */}
          <div className="bg-sky-500/5 border border-sky-500/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <ArrowRightLeft size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">{t('exchange_volume') || 'Exchange Volume'}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900 dark:text-white">${stats.exchangeVolume.toLocaleString()}</p>
              <div className="pt-2 mt-2 border-t border-sky-500/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('profit') || 'قازانج'}</p>
                <p className={`text-sm font-bold ${stats.exchangeProfitIQD >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  IQD {stats.exchangeProfitIQD.toLocaleString()}
                </p>
                <p className={`text-sm font-bold ${stats.exchangeProfitTOMAN >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  TOMAN {stats.exchangeProfitTOMAN.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Hawala Volume */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Send size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">{t('hawala_volume') || 'Hawala Volume'}</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900 dark:text-white">${stats.hawalaVolume.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Transferred</p>
            </div>
          </div>
        </div>

        {/* Transaction List Summary */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('transaction_list') || 'Transaction Log'} ({stats.totalTx})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('time') || 'Time'}</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('type') || 'Type'}</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('amount') || 'Amount'}</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('client_note') || 'Client/Note'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-bold text-sm">{t('no_transactions_period') || 'No transactions in this period.'}</td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tx.type.includes('income') || tx.type.includes('buy') || tx.type.includes('receive') 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">
                        {tx.amount.toLocaleString()} <span className="text-[10px] text-slate-500">{tx.currency}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {tx.clientName || '-'}
                        {tx.note && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{tx.note}</div>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsView;
