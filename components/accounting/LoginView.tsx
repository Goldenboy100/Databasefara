import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, UserCheck, AlertCircle, Sparkles, KeyRound, Lock } from 'lucide-react';
import { User } from '../../types.ts';
import { hasRole } from '../../utils.ts';

interface LoginViewProps {
  onLogin: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string; notFound?: boolean }>;
  t: (key: string) => string;
  currentUser?: User | null;
  onQuickOwnerLogin?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, 
  t, 
  currentUser, 
  onQuickOwnerLogin 
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isVipOrAdmin = currentUser && hasRole(currentUser, ['VIP+', 'vip+', 'vip_plus', 'admin', 'developer', 'VIP']);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError(t('enter_username_or_email') || 'تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە');
      return;
    }

    setIsLoading(true);
    try {
      const res = await onLogin(identifier, password);
      if (!res.success) {
        setError(res.error || t('invalid_credentials') || 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!');
      }
    } catch (err: any) {
      setError(err?.message || 'هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] p-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900/95 backdrop-blur-2xl p-7 md:p-9 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3 shadow-inner border border-amber-500/20">
            <ShieldCheck size={36} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('golden_accounting') || 'ژمێریاری زێڕین'}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              VIP+
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {t('accounting_login_subtitle') || 'تایبەت بە بەشداربووانی VIP+ و کارمەندەکانیان'}
          </p>
        </div>

        {/* Quick Login for Already Logged-in VIP+ User */}
        {isVipOrAdmin && onQuickOwnerLogin && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
              <Sparkles size={16} />
              <span>هەژماری خاوەنکار (VIP+) بەردەستە</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              تۆ وەک <strong>{currentUser?.name || currentUser?.email}</strong> چوویتەتە ناو ئەپەکە بە دەسەڵاتی VIP+. دەتوانیت بە یەک کلیک ژمێریارییەکەت بکەیتەوە.
            </p>
            <button
              type="button"
              onClick={onQuickOwnerLogin}
              className="mt-1 w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <UserCheck size={18} />
              {`چوونەژوورەوەی خێرا وەک ${currentUser?.name || 'خاوەنکار'}`}
            </button>
          </div>
        )}

        {/* Notice if logged in user does NOT have VIP+ */}
        {currentUser && !isVipOrAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Lock size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                پێویستت بە ڕۆڵی VIP+ هەیە
              </p>
              ئەم بەشە تەنها بۆ خاوەنکارانی VIP+ و کارمەندەکانیانە. ئەگەر بەڕێوەبەر ڕۆڵی پێ دایت دەتوانیت بچیتە ژوورەوە، یان ئەگەر کارمەندی بە زانیارییەکانی کارمەند لە خوارەوە بچۆ ژوورەوە.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              ئیمەیڵ یان ناوی بەکارهێنەر (خاوەنکاری VIP+ یان کارمەند)
            </label>
            <input 
              type="text" 
              placeholder="ئیمەیڵی خاوەنکار یان ناوی کارمەند" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              {t('password') || 'وشەی نهێنی'}
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full p-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <LogIn size={18} />
            {isLoading ? (t('logging_in') || 'چاوەڕێ بکە...') : (t('login') || 'چوونەژوورەوە')}
          </button>
        </form>

        {/* Security and Separation Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 font-medium leading-relaxed">
          <p className="flex items-center justify-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 mb-1">
            <Lock size={12} className="text-amber-500" />
            <span>ڕۆڵ تەنها لەلایەن بەڕێوەبەرەوە دیاری دەکرێت</span>
          </p>
          <p>
            تەنها ئەو کەسانەی لە لایەن بەڕێوەبەرەوە بەشداری VIP+ یان پێ دراوە، یان ئەو کارمەندانەی لە ناو نووسینگە زیادکراون، دەتوانن بچنە ژوورەوە.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginView;
