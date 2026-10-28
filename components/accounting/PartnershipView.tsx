import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Save, Trash2 } from 'lucide-react';
import { AccountingPartner, AccountingTransaction, User } from '../../types.ts';

interface PartnershipViewProps {
  onAddTransaction: (tx: AccountingTransaction) => void;
  onUpdateBalance: (usdChange: number, iqdChange: number, tomanChange?: number) => void;
  t: (key: string) => string;
  currentUser: User | null;
}

const PartnershipView: React.FC<PartnershipViewProps> = ({ onAddTransaction, onUpdateBalance, t, currentUser }) => {
  const [partners, setPartners] = useState<AccountingPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', share: '0' });
  
  const [selectedPartner, setSelectedPartner] = useState<AccountingPartner | null>(null);
  const [actionType, setActionType] = useState<'investment' | 'withdrawal' | 'profit'>('investment');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'IQD' | 'TOMAN'>('USD');
  const [note, setNote] = useState('');
  const [totalProfitToDistribute, setTotalProfitToDistribute] = useState('');

  useEffect(() => {
    const fetchPartners = async () => {
      const userId = currentUser?.id || 'guest';
      try {
        const res = await fetch(`/api/accounting_partners?userId=${userId}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPartners(data);
            try { localStorage.setItem(`acc_prt_${userId}`, JSON.stringify(data)); } catch (_) {}
            setIsLoading(false);
            return;
          }
        }
      } catch (_) {}

      try {
        const cached = localStorage.getItem(`acc_prt_${userId}`);
        if (cached) setPartners(JSON.parse(cached));
      } catch (_) {}
      setIsLoading(false);
    };
    fetchPartners();
  }, [currentUser?.id]);

  useEffect(() => {
    if (isLoading) return;
    const userId = currentUser?.id || 'guest';
    try { localStorage.setItem(`acc_prt_${userId}`, JSON.stringify(partners)); } catch (_) {}
    fetch(`/api/accounting_partners?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partners)
    }).catch(() => {});
  }, [partners, isLoading, currentUser?.id]);

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;

    const partner: AccountingPartner = {
      id: Date.now().toString(),
      name: newPartner.name,
      sharePercentage: parseFloat(newPartner.share) || 0,
      capitalUSD: 0,
      capitalIQD: 0,
      capitalToman: 0,
      capitalGBP: 0,
      capitalEUR: 0,
      capitalTRY: 0,
      capitalSAR: 0,
      capitalAED: 0,
      joinedAt: new Date().toISOString()
    };

    try {
      setPartners(prev => [partner, ...prev]);
      setNewPartner({ name: '', share: '0' });
      setShowAddPartner(false);
    } catch (error) {
      console.error("Error adding partner:", error);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this partner?')) return;
    try {
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting partner:", error);
    }
  };

  const handlePartnerAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !amount) return;

    const numAmount = parseFloat(amount);
    const typeMap = {
      investment: 'partner_investment',
      withdrawal: 'partner_withdrawal',
      profit: 'profit_distribution'
    };

    const tx: AccountingTransaction = {
      id: Date.now().toString(),
      type: typeMap[actionType] as any,
      amount: numAmount,
      currency,
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      note,
      status: 'completed',
      date: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };

    onAddTransaction(tx);

    // Update Partner Capital
    const updatedPartner = { ...selectedPartner };
    const multiplier = actionType === 'investment' ? 1 : -1;
    
    if (currency === 'USD') updatedPartner.capitalUSD += (numAmount * multiplier);
    else if (currency === 'IQD') updatedPartner.capitalIQD += (numAmount * multiplier);
    else if (currency === 'TOMAN') updatedPartner.capitalToman = (updatedPartner.capitalToman || 0) + (numAmount * multiplier);
    else if (currency === 'GBP') updatedPartner.capitalGBP = (updatedPartner.capitalGBP || 0) + (numAmount * multiplier);
    else if (currency === 'EUR') updatedPartner.capitalEUR = (updatedPartner.capitalEUR || 0) + (numAmount * multiplier);
    else if (currency === 'TRY') updatedPartner.capitalTRY = (updatedPartner.capitalTRY || 0) + (numAmount * multiplier);
    else if (currency === 'SAR') updatedPartner.capitalSAR = (updatedPartner.capitalSAR || 0) + (numAmount * multiplier);
    else if (currency === 'AED') updatedPartner.capitalAED = (updatedPartner.capitalAED || 0) + (numAmount * multiplier);

    try {
      setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));
      
      // Update Company Balance
      if (currency === 'USD') onUpdateBalance(numAmount * multiplier, 0, 0);
      else if (currency === 'IQD') onUpdateBalance(0, numAmount * multiplier, 0);
      else if (currency === 'TOMAN') onUpdateBalance(0, 0, numAmount * multiplier);
      else onUpdateBalance(0, 0, 0); // Placeholder for other currencies if needed

      setAmount('');
      setNote('');
      setSelectedPartner(null);
    } catch (error) {
      console.error("Error updating partner capital:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('partnership_management')}</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('manage_shareholders')}</p>
        </div>
        <button 
          onClick={() => setShowAddPartner(!showAddPartner)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={18} />
          {t('add_new_partner').toUpperCase()}
        </button>
      </div>

      {showAddPartner && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-primary/20 shadow-xl"
        >
          <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('partner_name')}</label>
              <input 
                type="text"
                value={newPartner.name}
                onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('partner_name')}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('share_percentage')}</label>
              <input 
                type="number"
                value={newPartner.share}
                onChange={(e) => setNewPartner({...newPartner, share: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                max="100"
                required
              />
            </div>
            <button type="submit" className="bg-emerald-500 text-white h-[50px] rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20">
              {t('save_partner').toUpperCase()}
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partners List */}
        <div className="lg:col-span-2 space-y-4">
          {partners.map(partner => (
            <div key={partner.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{partner.name}</h3>
                    <div className="flex items-center gap-2">
                      <PieChart size={12} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{partner.sharePercentage}% {t('ownership')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => setSelectedPartner(partner)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePartner(partner.id)}
                    className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">USD</p>
                    <p className="text-sm font-black text-emerald-500">${partner.capitalUSD.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IQD</p>
                    <p className="text-sm font-black text-sky-500">{partner.capitalIQD.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOMAN</p>
                    <p className="text-sm font-black text-orange-500">{(partner.capitalToman || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GBP</p>
                    <p className="text-sm font-black text-purple-500">{(partner.capitalGBP || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EUR</p>
                    <p className="text-sm font-black text-blue-500">{(partner.capitalEUR || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TRY</p>
                    <p className="text-sm font-black text-amber-600">{(partner.capitalTRY || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SAR</p>
                    <p className="text-sm font-black text-teal-600">{(partner.capitalSAR || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AED</p>
                    <p className="text-sm font-black text-cyan-600">{(partner.capitalAED || 0).toLocaleString()}</p>
                  </div>
                </div>
            </div>
          ))}
        </div>

        {/* Transaction Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl sticky top-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="text-primary" size={20} />
              {t('partner_transaction')}
            </h3>

            <form onSubmit={handlePartnerAction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('select_partner')}</label>
                <select 
                  value={selectedPartner?.id || ''}
                  onChange={(e) => setSelectedPartner(partners.find(p => p.id === e.target.value) || null)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-primary appearance-none"
                  required
                >
                  <option value="">{t('choose_partner')}</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
                {(['investment', 'withdrawal', 'profit'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActionType(type)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter ${
                      actionType === type ? 'bg-white dark:bg-slate-800 text-primary shadow-lg' : 'text-slate-500'
                    }`}
                  >
                    {t(type === 'profit' ? 'profit_distribution' : type)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('amount')}</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('language') === 'ku' ? 'دراو' : t('language') === 'ar' ? 'العملة' : 'Currency'}</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="USD">USD</option>
                    <option value="IQD">IQD</option>
                    <option value="TOMAN">{t('toman').toUpperCase()}</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                    <option value="TRY">TRY</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('description')}</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                  placeholder={t('details_transaction')}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20"
              >
                <Save size={18} />
                {t('record_transaction').toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Profit Calculator Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('profit_calculator')}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('calculate_shares_desc') || 'Calculate how much each partner gets'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('total_profit_to_distribute')}</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="number"
                value={totalProfitToDistribute}
                onChange={(e) => setTotalProfitToDistribute(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-slate-900 dark:text-white font-black outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {partners.map(partner => {
                const share = (parseFloat(totalProfitToDistribute) || 0) * (partner.sharePercentage / 100);
                return (
                  <div key={partner.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{partner.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-slate-500">{partner.sharePercentage}%</span>
                      <p className="text-sm font-black text-emerald-500">
                        ${share.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipView;
