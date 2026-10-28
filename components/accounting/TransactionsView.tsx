import React, { useState } from 'react';
import { History, Search, Filter, ArrowRightLeft, ArrowDownRight, Send } from 'lucide-react';
import { AccountingTransaction } from '../../types.ts';

interface TransactionsViewProps {
  transactions: AccountingTransaction[];
  t: (key: string) => string;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.clientName && tx.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.senderName && tx.senderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.receiverName && tx.receiverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesFilter = filterType === 'all' || tx.type.includes(filterType);
    
    return matchesSearch && matchesFilter;
  });

  const getIconForType = (type: string) => {
    if (type.includes('exchange')) return <ArrowRightLeft size={16} />;
    if (type.includes('hawala')) return <Send size={16} />;
    if (type === 'expense') return <ArrowDownRight size={16} />;
    return <History size={16} />;
  };

  const getColorForType = (type: string) => {
    if (type === 'exchange_buy') return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (type === 'exchange_sell') return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
    if (type === 'hawala_send') return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    if (type === 'hawala_receive') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    if (type === 'expense') return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <History className="text-slate-600 dark:text-slate-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Transaction History</h2>
            <p className="text-xs text-slate-500">View all company operations</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, note..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm appearance-none"
          >
            <option value="all">All Types</option>
            <option value="exchange">Exchange</option>
            <option value="hawala">Hawala</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type & Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">User</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorForType(tx.type)}`}>
                          {getIconForType(tx.type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                            {tx.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {tx.type.includes('exchange') && (
                          <span>Client: <span className="font-bold">{tx.clientName || 'Walk-in'}</span> (Rate: {tx.rate})</span>
                        )}
                        {tx.type.includes('hawala') && (
                          <span>
                            <span className="font-bold">{tx.senderName}</span> → <span className="font-bold">{tx.receiverName}</span>
                            <br/><span className="text-xs text-slate-500">Dest: {tx.destination}</span>
                          </span>
                        )}
                        {tx.type === 'expense' && (
                          <span>Category: <span className="font-bold">{tx.category}</span></span>
                        )}
                        {tx.note && <p className="text-xs text-slate-500 mt-1">Note: {tx.note}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <p className={`text-sm font-black ${tx.type === 'expense' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                        {tx.amount.toLocaleString()} {tx.currency}
                      </p>
                      {tx.totalConverted && (
                        <p className="text-xs text-slate-500 font-bold">
                          {tx.totalConverted.toLocaleString()} IQD
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-slate-500 font-bold">
                      {tx.createdBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsView;
