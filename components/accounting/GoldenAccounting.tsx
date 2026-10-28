import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { 
  LayoutDashboard, ArrowRightLeft, Send, Users, 
  Receipt, History, Settings, Wallet, PieChart,
  LogIn, LogOut, ShieldCheck, CheckCircle, AlertCircle, Wifi, Smartphone, Zap, FileText
} from 'lucide-react';
import { AppConfig, LanguageCode, User, AccountingBalance, AccountingClient, AccountingTransaction, Employee } from '../../types.ts';
import { hasRole } from '../../utils.ts';

// Sub-components
import DashboardView from './DashboardView.tsx';
import ExchangeView from './ExchangeView.tsx';
import QuickExchangeView from './QuickExchangeView.tsx';
import HawalaView from './HawalaView.tsx';
import ClientsView from './ClientsView.tsx';
import ExpensesView from './ExpensesView.tsx';
import TransactionsView from './TransactionsView.tsx';
import PartnershipView from './PartnershipView.tsx';
import ReportsView from './ReportsView.tsx';
import EmployeesView from './EmployeesView.tsx';
import LoginView from './LoginView.tsx';

interface GoldenAccountingProps {
  config: AppConfig;
  language: LanguageCode;
  t: (key: string) => string;
  currentUser: User | null;
  onUserLogin?: (user: User) => void;
}

type AccountingTab = 'dashboard' | 'quick_exchange' | 'exchange' | 'hawala' | 'partnership' | 'clients' | 'employees' | 'expenses' | 'transactions' | 'reports';

const GoldenAccounting: React.FC<GoldenAccountingProps> = ({ config, language, t, currentUser, onUserLogin }) => {
  const [activeTab, setActiveTab] = useState<AccountingTab>('dashboard');
  const sessionKey = 'golden_accounting_active_session';

  // State for accounting user session
  const [accountingUser, setAccountingUser] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem(sessionKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return null;
  });
  
  // Active store owner ID (whose data is being managed)
  const storeUserId = accountingUser?.storeOwnerUserId || accountingUser?.userId || (currentUser?.id && currentUser.id !== 'guest' ? currentUser.id : 'guest');

  // State for accounting data
  const [balance, setBalance] = useState<AccountingBalance>({ usd: 0, iqd: 0, toman: 0, lastUpdated: new Date().toISOString() });
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [clients, setClients] = useState<AccountingClient[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data with localStorage fallback and safe JSON parsing
  useEffect(() => {
    if (!storeUserId || storeUserId === 'guest') {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      const safeFetchJson = async (endpoint: string, localKey: string, fallback: any) => {
        try {
          const res = await fetch(endpoint);
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data !== null && data !== undefined) {
              try {
                localStorage.setItem(localKey, JSON.stringify(data));
              } catch (_) {}
              return data;
            }
          }
        } catch (_) {}

        try {
          const cached = localStorage.getItem(localKey);
          if (cached) return JSON.parse(cached);
        } catch (_) {}

        return fallback;
      };

      try {
        const [balData, txData, clientsData, employeesData] = await Promise.all([
          safeFetchJson(`/api/accounting_balance?userId=${storeUserId}`, `acc_bal_${storeUserId}`, { usd: 0, iqd: 0, toman: 0, lastUpdated: new Date().toISOString() }),
          safeFetchJson(`/api/accounting_transactions?userId=${storeUserId}`, `acc_tx_${storeUserId}`, []),
          safeFetchJson(`/api/accounting_clients?userId=${storeUserId}`, `acc_cli_${storeUserId}`, []),
          safeFetchJson(`/api/accounting_employees?userId=${storeUserId}`, `acc_emp_${storeUserId}`, [])
        ]);

        setBalance(balData);
        setTransactions(txData);
        setClients(clientsData);
        setEmployees(employeesData);
      } catch (error) {
        console.warn("Accounting data loaded with defaults:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [storeUserId]);

  // Persistence Effects
  useEffect(() => {
    if (isLoading || !storeUserId || storeUserId === 'guest') return;
    try {
      localStorage.setItem(`acc_bal_${storeUserId}`, JSON.stringify(balance));
    } catch (_) {}
    fetch(`/api/accounting_balance?userId=${storeUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balance)
    }).catch(() => {});
  }, [balance, isLoading, storeUserId]);

  useEffect(() => {
    if (isLoading || !storeUserId || storeUserId === 'guest') return;
    try {
      localStorage.setItem(`acc_tx_${storeUserId}`, JSON.stringify(transactions));
    } catch (_) {}
    fetch(`/api/accounting_transactions?userId=${storeUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions)
    }).catch(() => {});
  }, [transactions, isLoading, storeUserId]);

  useEffect(() => {
    if (isLoading || !storeUserId || storeUserId === 'guest') return;
    try {
      localStorage.setItem(`acc_cli_${storeUserId}`, JSON.stringify(clients));
    } catch (_) {}
    fetch(`/api/accounting_clients?userId=${storeUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clients)
    }).catch(() => {});
  }, [clients, isLoading, storeUserId]);

  useEffect(() => {
    if (isLoading || !storeUserId || storeUserId === 'guest') return;
    try {
      localStorage.setItem(`acc_emp_${storeUserId}`, JSON.stringify(employees));
    } catch (_) {}
    fetch(`/api/accounting_employees?userId=${storeUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employees)
    }).catch(() => {});
  }, [employees, isLoading, storeUserId]);

  // Server-backed login handler for both store owners and employees
  const handleLogin = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string; notFound?: boolean }> => {
    try {
      const res = await fetch('/api/accounting_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      if (res.ok && data.success) {
        const sessionUser: Employee = {
          id: data.session.id,
          name: data.session.name,
          email: data.session.email,
          role: data.session.role,
          createdAt: data.session.createdAt,
          userId: data.session.userId,
          storeOwnerUserId: data.storeOwnerUserId || data.session.userId
        };

        setAccountingUser(sessionUser);
        try {
          localStorage.setItem(sessionKey, JSON.stringify(sessionUser));
        } catch (_) {}

        if (data.user && onUserLogin) {
          onUserLogin(data.user);
        }

        return { success: true };
      }

      return { 
        success: false, 
        error: data.error || 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!',
        notFound: data.notFound
      };
    } catch (err: any) {
      console.error("Login fetch error:", err);
      // Fallback local check
      const cleanId = identifier.trim().toLowerCase();

      if (currentUser && (cleanId === currentUser.email?.toLowerCase().trim() || cleanId === currentUser.name?.toLowerCase().trim())) {
        const fallbackSession: Employee = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'admin',
          createdAt: currentUser.createdAt || new Date().toISOString(),
          userId: currentUser.id,
          storeOwnerUserId: currentUser.id
        };
        setAccountingUser(fallbackSession);
        try { localStorage.setItem(sessionKey, JSON.stringify(fallbackSession)); } catch (_) {}
        return { success: true };
      }

      return { success: false, error: 'هەڵەیەک ڕوویدا لە پەیوەندیکردن بە سێرڤەر' };
    }
  };

  const handleQuickOwnerLogin = () => {
    if (!currentUser || !hasRole(currentUser, ['VIP+', 'vip+', 'vip_plus', 'admin', 'developer', 'VIP'])) {
      return;
    }
    const ownerId = currentUser.id || 'admin';
    const ownerSession: Employee = {
      id: ownerId,
      name: currentUser.name || 'خاوەنکار',
      email: currentUser.email || 'admin@golden.local',
      role: 'admin',
      createdAt: currentUser.createdAt || new Date().toISOString(),
      userId: ownerId,
      storeOwnerUserId: ownerId
    };
    setAccountingUser(ownerSession);
    try { localStorage.setItem(sessionKey, JSON.stringify(ownerSession)); } catch (_) {}
  };

  const handleLogout = () => {
    setAccountingUser(null);
    setBalance({ usd: 0, iqd: 0, toman: 0, lastUpdated: new Date().toISOString() });
    setTransactions([]);
    setClients([]);
    setEmployees([]);
    try { localStorage.removeItem(sessionKey); } catch (_) {}
  };

  const handleGoogleLogin = (data: any) => {
    if (data && data.success) {
      const sessionUser: Employee = {
        id: data.session.id,
        name: data.session.name,
        email: data.session.email,
        role: data.session.role,
        createdAt: data.session.createdAt,
        userId: data.session.userId,
        storeOwnerUserId: data.storeOwnerUserId || data.session.userId
      };

      setAccountingUser(sessionUser);
      try { localStorage.setItem(sessionKey, JSON.stringify(sessionUser)); } catch (_) {}
      if (data.user && onUserLogin) onUserLogin(data.user);
    }
  };

  // If not logged in, show LoginView
  if (!accountingUser) {
    const isVipOrAdmin = currentUser && hasRole(currentUser, ['VIP+', 'vip+', 'vip_plus', 'admin', 'developer', 'VIP']);
    return (
      <LoginView 
        onLogin={handleLogin} 
        onGoogleLogin={handleGoogleLogin}
        t={t} 
        currentUser={currentUser}
        onQuickOwnerLogin={isVipOrAdmin ? handleQuickOwnerLogin : undefined}
      />
    );
  }

  const isAdmin = accountingUser.role === 'admin';
  const filteredTransactions = isAdmin 
    ? transactions 
    : transactions.filter(tx => tx.employeeId === accountingUser.id || tx.createdBy === accountingUser.name);

  const tabs = [
    { id: 'dashboard', label: t('dashboard') || 'داشبۆرد', icon: LayoutDashboard },
    { id: 'quick_exchange', label: t('quick_exchange') || 'ئاڵوگۆڕی خێرا', icon: Zap },
    { id: 'exchange', label: t('exchange') || 'ئاڵوگۆڕی دراو', icon: ArrowRightLeft },
    { id: 'hawala', label: t('hawala') || 'حەواڵە', icon: Send },
    { id: 'partnership', label: t('partnership') || 'شەریکایەتی', icon: PieChart },
    { id: 'clients', label: t('clients') || 'کڕیاران و قەرز', icon: Users },
    ...(isAdmin ? [{ id: 'employees', label: t('employees') || 'کارمەندان', icon: Users }] : []),
    { id: 'expenses', label: t('expenses') || 'خەرجییەکان', icon: Receipt },
    { id: 'transactions', label: t('transactions') || 'مێژووی کارەکان', icon: History },
    { id: 'reports', label: t('reports') || 'ڕاپۆرتەکان', icon: FileText },
  ];

  const handleAddTransaction = async (tx: AccountingTransaction) => {
    try {
      const txWithEmployee: AccountingTransaction = { 
        ...tx, 
        employeeId: accountingUser.id,
        createdBy: tx.createdBy || accountingUser.name || 'کارمەند'
      };
      setTransactions(prev => [txWithEmployee, ...prev]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleUpdateBalance = async (usdChange: number, iqdChange: number, tomanChange: number = 0) => {
    try {
      setBalance(prev => ({
        ...prev,
        usd: Math.round(((prev.usd || 0) + usdChange) * 100) / 100,
        iqd: Math.round(((prev.iqd || 0) + iqdChange) * 100) / 100,
        toman: Math.round(((prev.toman || 0) + tomanChange) * 100) / 100,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleUpdateFullBalance = async (newBalance: AccountingBalance) => {
    try {
      setBalance({
        ...newBalance,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating full balance:", error);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('golden_accounting') || 'ژمێریاری زێڕین'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isAdmin ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              }`}>
                {accountingUser.name} ({isAdmin ? (t('role_admin') || 'بەڕێوەبەر') : (t('role_employee') || 'کارمەند')})
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500">{t('accounting_tagline') || 'سیستەمی تەواوی دارایی و ئاڵوگۆڕی دراو'}</p>
          </div>
        </div>
        
        {/* Quick Balance Summary + Logout */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full">
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[110px]">
            <p className="text-[10px] font-black text-slate-400 uppercase">{t('usd_balance') || 'باڵانسی USD'}</p>
            <p className="text-base font-black text-emerald-500 font-mono">${(balance.usd || 0).toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[110px]">
            <p className="text-[10px] font-black text-slate-400 uppercase">{t('iqd_balance') || 'باڵانسی IQD'}</p>
            <p className="text-base font-black text-sky-500 font-mono">{(balance.iqd || 0).toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[110px]">
            <p className="text-[10px] font-black text-slate-400 uppercase">{t('toman_balance') || 'تۆمەن'}</p>
            <p className="text-base font-black text-orange-500 font-mono">{(balance.toman || 0).toLocaleString()}</p>
          </div>

          <button
            onClick={handleLogout}
            title={t('logout') || 'دەرچوون لە ژمێریاری'}
            className="p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-1.5 text-xs shrink-0"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t('logout') || 'دەرچوون'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AccountingTab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView 
                balance={balance} 
                transactions={filteredTransactions} 
                clients={clients} 
                t={t} 
                onUpdateFullBalance={handleUpdateFullBalance}
              />
            )}
            {activeTab === 'quick_exchange' && (
              <QuickExchangeView 
                onAddTransaction={handleAddTransaction} 
                onUpdateBalance={handleUpdateBalance} 
                t={t} 
                currentUser={currentUser}
              />
            )}
            {activeTab === 'exchange' && (
              <ExchangeView 
                onAddTransaction={handleAddTransaction} 
                onUpdateBalance={handleUpdateBalance} 
                t={t} 
                currentUser={currentUser}
              />
            )}
            {activeTab === 'hawala' && (
              <HawalaView 
                onAddTransaction={handleAddTransaction} 
                onUpdateBalance={handleUpdateBalance} 
                t={t} 
                currentUser={currentUser}
              />
            )}
            {activeTab === 'partnership' && (
              <PartnershipView 
                onAddTransaction={handleAddTransaction} 
                onUpdateBalance={handleUpdateBalance} 
                t={t} 
                currentUser={currentUser}
              />
            )}
            {activeTab === 'clients' && (
              <ClientsView 
                clients={clients} 
                onAddClient={async (client) => {
                  try {
                    setClients(prev => [client, ...prev]);
                  } catch (error) {
                    console.error("Error adding client:", error);
                  }
                }} 
                t={t} 
              />
            )}
            {activeTab === 'employees' && isAdmin && (
              <EmployeesView 
                employees={employees} 
                onAddEmployee={async (employee) => {
                  try {
                    setEmployees(prev => [employee, ...prev]);
                  } catch (error) {
                    console.error("Error adding employee:", error);
                  }
                }} 
                onDeleteEmployee={handleDeleteEmployee}
                transactions={transactions}
                t={t} 
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesView 
                onAddTransaction={handleAddTransaction} 
                onUpdateBalance={handleUpdateBalance} 
                t={t} 
                currentUser={currentUser}
              />
            )}
            {activeTab === 'transactions' && (
              <TransactionsView 
                transactions={filteredTransactions} 
                t={t} 
              />
            )}
            {activeTab === 'reports' && (
              <ReportsView 
                transactions={filteredTransactions} 
                t={t} 
                currentUser={currentUser}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoldenAccounting;
