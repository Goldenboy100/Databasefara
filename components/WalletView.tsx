import React, { useState } from 'react';
import { Wallet, CreditCard, TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownLeft, Briefcase, Banknote, ShoppingBag, Calendar, FileText, PieChart, DollarSign, X, Target, Edit2, Check } from 'lucide-react';
import { User } from '../types.ts';

interface WalletViewProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  t: (key: string) => string;
}

const WalletView: React.FC<WalletViewProps> = React.memo(({ currentUser, onUpdateUser, t }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportDate, setSelectedReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'salary' | 'work'>('expense');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const [transactionCategory, setTransactionCategory] = useState('daily');
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalName, setGoalName] = useState(currentUser?.wallet?.savingsGoal?.name || '');
  const [goalTargetAmount, setGoalTargetAmount] = useState(currentUser?.wallet?.savingsGoal?.targetAmount?.toString() || '');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState(currentUser?.wallet?.savingsGoal?.currentAmount?.toString() || '');
  const [goalDeadline, setGoalDeadline] = useState(currentUser?.wallet?.savingsGoal?.deadline || '');

  const handleSaveGoal = React.useCallback(() => {
    if (!currentUser) return;
    
    const target = parseFloat(goalTargetAmount);
    const current = parseFloat(goalCurrentAmount) || 0;
    
    if (isNaN(target) || !goalName.trim()) return;

    onUpdateUser({
      ...currentUser,
      wallet: {
        ...(currentUser.wallet || { balance: 0, currency: 'IQD' }),
        savingsGoal: {
          name: goalName.trim(),
          targetAmount: target,
          currentAmount: current,
          deadline: goalDeadline || undefined
        }
      }
    });
    setIsEditingGoal(false);
  }, [currentUser, goalName, goalTargetAmount, goalCurrentAmount, goalDeadline, onUpdateUser]);

  const walletStats = React.useMemo(() => {
    if (!currentUser?.wallet?.history) return { income: 0, expense: 0 };
    return currentUser.wallet.history.reduce((acc, tx) => {
      if (['income', 'salary', 'work'].includes(tx.type)) {
        acc.income += tx.amount;
      } else {
        acc.expense += tx.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [currentUser?.wallet?.history]);

  const reportData = React.useMemo(() => {
    if (!currentUser?.wallet?.history) return { income: 0, expense: 0, transactions: [] };
    const filtered = currentUser.wallet.history.filter(tx => 
      new Date(tx.date).toISOString().split('T')[0] === selectedReportDate
    );
    return filtered.reduce((acc, tx) => {
      if (['income', 'salary', 'work'].includes(tx.type)) {
        acc.income += tx.amount;
      } else {
        acc.expense += tx.amount;
      }
      acc.transactions.push(tx);
      return acc;
    }, { income: 0, expense: 0, transactions: [] as any[] });
  }, [currentUser?.wallet?.history, selectedReportDate]);

  const handleAddWalletTransaction = React.useCallback(() => {
    if (!currentUser || !transactionAmount || !transactionDesc) return;
    
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount)) return;

    const newTransaction = {
      id: crypto.randomUUID(),
      type: transactionType,
      amount: amount,
      description: transactionDesc,
      date: new Date().toISOString(),
      category: transactionCategory
    };

    const currentBalance = currentUser.wallet?.balance || 0;
    const isIncome = ['income', 'salary', 'work'].includes(transactionType);
    const newBalance = isIncome ? currentBalance + amount : currentBalance - amount;

    const updatedWallet = {
      ...(currentUser.wallet || { currency: 'IQD', address: '' }),
      balance: newBalance,
      history: [newTransaction, ...(currentUser.wallet?.history || [])]
    };

    onUpdateUser({
      ...currentUser,
      wallet: updatedWallet
    });

    setTransactionAmount('');
    setTransactionDesc('');
  }, [currentUser, transactionAmount, transactionDesc, transactionType, transactionCategory, onUpdateUser]);

  return (
    <div className="space-y-6 pt-2 pb-24 max-w-xl mx-auto animate-in fade-in duration-500 px-2">
      <div className="flex justify-between items-center px-4 mb-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic tracking-tighter mb-1 uppercase">{t('my_wallet')}</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('wallet_balance')}</p>
        </div>
        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-lg">
          <Wallet size={28} />
        </div>
      </div>

      <div className="mb-8">
        <div className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700 rounded-3xl p-6 shadow-2xl shadow-emerald-500/20 overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">{t('golden_exchange') || 'Golden Exchange'}</span>
                <div className="w-10 h-8 bg-gradient-to-br from-amber-400 to-amber-200 rounded-md shadow-inner flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-0.5 opacity-40">
                    {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 border-[0.5px] border-black/20" />)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-full bg-rose-500/80 mix-blend-screen" />
                  <div className="w-8 h-8 rounded-full bg-amber-500/80 -ml-4 mix-blend-screen" />
                </div>
                <span className="text-[8px] font-black text-white/40 uppercase mt-1 italic">{t('premium_wallet') || 'Premium Wallet'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t('wallet_balance')}</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-white tracking-tighter italic">
                  {currentUser?.wallet?.balance?.toLocaleString() || '0'}
                </h2>
                <span className="text-sm font-black text-white/80 uppercase">{currentUser?.wallet?.currency || 'IQD'}</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">{t('card_holder') || 'Card Holder'}</span>
                <span className="text-sm font-black text-white uppercase tracking-wider truncate max-w-[180px]">{currentUser?.name}</span>
              </div>
              <div className="text-white/80">
                <CreditCard size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1">{t('income') || 'Income'}</p>
            <p className="text-sm font-black text-emerald-600">+{walletStats.income.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest leading-none mb-1">{t('expense') || 'Expense'}</p>
            <p className="text-sm font-black text-rose-600">-{walletStats.expense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('add_transaction')}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTransactionType('expense')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${transactionType === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <ShoppingBag size={14} />
                {t('expense_daily')}
              </button>
              <button 
                onClick={() => setTransactionType('salary')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${transactionType === 'salary' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <Banknote size={14} />
                {t('salary')}
              </button>
              <button 
                onClick={() => setTransactionType('work')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${transactionType === 'work' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <Briefcase size={14} />
                {t('work_income')}
              </button>
              <button 
                onClick={() => setTransactionType('income')}
                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${transactionType === 'income' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                <ArrowUpRight size={14} />
                {t('expense_general')}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <DollarSign size={16} />
              </div>
              <input 
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder={t('amount')}
                className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
            <input 
              type="text"
              value={transactionDesc}
              onChange={(e) => setTransactionDesc(e.target.value)}
              placeholder={t('description')}
              className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
            <button 
              onClick={handleAddWalletTransaction}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {t('add_transaction')}
            </button>
          </div>
        </div>

        {/* Savings Goal */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-blue-500" />
              {t('savings_goal') || 'Savings Goal'}
            </h3>
            <button 
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              {isEditingGoal ? <X size={14} /> : <Edit2 size={14} />}
            </button>
          </div>

          {isEditingGoal ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <input 
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder={t('goal_name_placeholder') || "Goal Name (e.g., New Car)"}
                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  placeholder={t('target_amount') || "Target Amount"}
                  className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <input 
                  type="number"
                  value={goalCurrentAmount}
                  onChange={(e) => setGoalCurrentAmount(e.target.value)}
                  placeholder={t('current_saved') || "Current Saved"}
                  className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <input 
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-500"
              />
              <button 
                onClick={handleSaveGoal}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} /> {t('save_goal') || 'Save Goal'}
              </button>
            </div>
          ) : currentUser?.wallet?.savingsGoal ? (
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{currentUser.wallet.savingsGoal.name}</p>
                  {currentUser.wallet.savingsGoal.deadline && (
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {t('target_date') || 'Target:'} {new Date(currentUser.wallet.savingsGoal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-500">
                    {currentUser.wallet.savingsGoal.currentAmount.toLocaleString()} / {currentUser.wallet.savingsGoal.targetAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{currentUser.wallet.currency || 'IQD'}</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, (currentUser.wallet.savingsGoal.currentAmount / currentUser.wallet.savingsGoal.targetAmount) * 100))}%` }}
                />
              </div>
              <p className="text-center text-[10px] font-black text-slate-500">
                {Math.round((currentUser.wallet.savingsGoal.currentAmount / currentUser.wallet.savingsGoal.targetAmount) * 100)}% {t('completed') || 'Completed'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 opacity-60">
              <Target size={32} className="mb-2 text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 text-center">{t('no_savings_goal') || 'No savings goal set.'}<br/>{t('click_to_create') || 'Click the edit icon to create one.'}</p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('history')}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                title={t('daily_report')}
              >
                <FileText size={14} />
              </button>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search_placeholder') || "Search..."}
                  className="pl-6 pr-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-500/20 w-24 sm:w-32"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
            {currentUser?.wallet?.history && currentUser.wallet.history.length > 0 ? (
              currentUser.wallet.history
                .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.type.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((tx) => {
                  const isIncome = ['income', 'salary', 'work'].includes(tx.type);
                  return (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {tx.type === 'salary' && <Banknote size={18} />}
                          {tx.type === 'work' && <Briefcase size={18} />}
                          {tx.type === 'expense' && <ShoppingBag size={18} />}
                          {tx.type === 'income' && <ArrowUpRight size={18} />}
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-slate-800 dark:text-white leading-none mb-1">{tx.description}</p>
                          <p className="text-[9px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{tx.type}</p>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-40">
                <Search size={32} className="mb-2" />
                <p className="text-[10px] font-bold text-slate-400">{t('no_history')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('wallet_address')}</p>
          <input 
            type="text"
            value={currentUser?.wallet?.address || ''}
            onChange={(e) => {
              if (!currentUser) return;
              onUpdateUser({
                ...currentUser,
                wallet: {
                  ...(currentUser.wallet || { balance: 0, currency: 'IQD' }),
                  address: e.target.value
                }
              });
            }}
            placeholder={t('enter_wallet_address') || "Enter wallet address..."}
            className="w-full bg-transparent border-none p-0 font-bold text-sm text-slate-700 dark:text-slate-300 focus:ring-0"
          />
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('wallet_currency')}</p>
          <select 
            value={currentUser?.wallet?.currency || 'IQD'}
            onChange={(e) => {
              if (!currentUser) return;
              onUpdateUser({
                ...currentUser,
                wallet: {
                  ...(currentUser.wallet || { balance: 0, currency: 'IQD' }),
                  currency: e.target.value
                }
              });
            }}
            className="w-full bg-transparent border-none p-0 font-bold text-sm text-slate-700 dark:text-slate-300 focus:ring-0"
          >
            <option value="IQD">IQD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
            <option value="IRR">IRR</option>
          </select>
        </div>
      </div>

      {/* Daily Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowReportModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-emerald-500/20 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <PieChart size={20} />
                </div>
                <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{t('daily_report')}</h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('select_date')}</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date"
                    value={selectedReportDate}
                    onChange={(e) => setSelectedReportDate(e.target.value)}
                    max="2100-12-31"
                    className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">{t('total_income')}</p>
                  <p className="text-lg font-black text-emerald-600">+{reportData.income.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mb-1">{t('total_expense')}</p>
                  <p className="text-lg font-black text-rose-600">-{reportData.expense.toLocaleString()}</p>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center ${
                reportData.income - reportData.expense >= 0 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('net_profit')}</p>
                <p className={`text-3xl font-black italic tracking-tighter ${
                  reportData.income - reportData.expense >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {(reportData.income - reportData.expense).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('summary')}</h3>
                <div className="space-y-2">
                  {reportData.transactions.length > 0 ? (
                    reportData.transactions.map((tx) => {
                      const isIncome = ['income', 'salary', 'work'].includes(tx.type);
                      return (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-800 dark:text-white leading-none mb-1">{tx.description}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{tx.type}</p>
                            </div>
                          </div>
                          <p className={`text-xs font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-[10px] font-bold text-slate-400 py-8 italic">{t('no_transactions_date') || 'No transactions for this date'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default WalletView;
