
import React, { useState, useRef } from 'react';
import { Settings, ChevronLeft, Moon, Languages, ShieldCheck, LogOut, Check, User as UserIcon, Crown, Shield, Gem, Pen, Cpu, DollarSign, MessageSquare, Send, X, Image as ImageIcon, Info, Sparkles, Star } from 'lucide-react';
import { User, ViewMode, ThemeMode, LanguageCode, AppConfig, SupportTicket } from '../types.ts';
import { hasRole, getRoles } from '../utils.ts';

interface SettingsViewProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onViewChange: (view: ViewMode) => void;
  onLogout: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onAddSupportTicket: (ticket: SupportTicket) => void;
  onAddReplyToTicket: (ticketId: string, message: string) => void;
  supportTickets: SupportTicket[];
  deferredPrompt: any;
  onInstall: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = React.memo(({ 
  currentUser, onUpdateUser, onViewChange, onLogout, language, setLanguage, t, config, onUpdateConfig, onAddSupportTicket, onAddReplyToTicket, supportTickets,
  deferredPrompt, onInstall
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const supportImageInputRef = useRef<HTMLInputElement>(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportImage, setSupportImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSupportImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('image_too_large'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSendSupport = React.useCallback(async () => {
    if (!supportMessage.trim() || !currentUser) return;
    setIsSending(true);
    
    const newTicket: SupportTicket = {
      id: crypto.randomUUID(),
      ticketNumber: Math.floor(Math.random() * 9999999999999) + 1,
      userId: currentUser.id,
      userName: currentUser.name,
      message: supportMessage.trim(),
      imageUrl: supportImage || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      replies: []
    };

    onAddSupportTicket(newTicket);
    setSupportMessage('');
    setSupportImage(null);
    setShowSupportModal(false);
    setIsSending(false);
  }, [supportMessage, currentUser, supportImage, onAddSupportTicket]);

  const handleShowLanguageModal = React.useCallback(() => setShowLanguageModal(true), []);
  const handleShowSupportModal = React.useCallback(() => setShowSupportModal(true), []);
  const handleShowVipModal = React.useCallback(() => setShowVipModal(true), []);
  const handleViewFeatures = React.useCallback(() => onViewChange('features'), [onViewChange]);
  const handleViewAccounts = React.useCallback(() => onViewChange('accounts'), [onViewChange]);
  const handleFontSizeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateConfig({...config, fontSize: parseInt(e.target.value)});
  }, [config, onUpdateConfig]);

  const handlePresetColorChange = React.useCallback((preset: any) => {
    if (hasRole(currentUser, 'developer')) {
      onUpdateConfig({
        ...config,
        backgroundColor: preset.bg,
        cardColor: preset.card,
        textColor: preset.text,
        primaryColor: preset.primary
      });
    }
  }, [currentUser, config, onUpdateConfig]);

  const handleCancelEditName = React.useCallback(() => {
    setIsEditingName(false);
    setName(currentUser?.name || '');
  }, [currentUser]);

  const handleEditName = React.useCallback(() => setIsEditingName(true), []);

  const handleAvatarClick = React.useCallback(() => avatarInputRef.current?.click(), []);
  const handleSupportImageClick = React.useCallback(() => supportImageInputRef.current?.click(), []);

  const roleIcons: Record<string, React.ReactElement> = {
    developer: <img src="https://i.ibb.co/tqBvB4S/crown.gif" alt="Crown" className="w-4 h-4" />,
    admin: <ShieldCheck size={14} className="text-emerald-500" />,
    'VIP+': <img src="https://i.ibb.co/cQx9cZc/gem.gif" alt="Gem" className="w-4 h-4" />,
    VIP: <Crown size={14} className="text-amber-500" />,
    staff: <Shield size={14} className="text-primary" />,
    editor: <Pen size={14} className="text-blue-500" />,
    moderator: <Shield size={14} className="text-blue-500" />,
    kargire: <Cpu size={14} className="text-slate-500" />,
    user: <UserIcon size={14} className="text-slate-500" />,
  };

  const handleNameSave = React.useCallback(() => {
    if (currentUser && name.trim() !== '') {
      onUpdateUser({ ...currentUser, name: name.trim() });
      setIsEditingName(false);
    }
  }, [currentUser, name, onUpdateUser]);

  const handleAvatarChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateUser({ ...currentUser, avatar: event.target.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }, [currentUser, onUpdateUser]);

  const handleVipPurchase = React.useCallback(() => {
    const message = encodeURIComponent(t('fib_payment_message'));
    window.open(`https://wa.me/9647519055494?text=${message}`, '_blank');
  }, [t]);

  return (
    <div className="space-y-6 pt-2 pb-24 max-w-xl mx-auto animate-in fade-in duration-500 px-2">
      <div className="flex justify-between items-center px-4 mb-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic tracking-tighter mb-1 uppercase">{t('settings')}</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('system_preferences')}</p>
        </div>
        <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-lg">
          <Settings size={28} />
        </div>
      </div>

      {currentUser && (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl p-6 flex items-center gap-5">
          <div className="relative group">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUser.email}`}
              alt="User Avatar"
              className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white/50 shadow-md object-cover"
            />
            <button 
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pen size={20} />
            </button>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-slate-900 dark:text-white">{currentUser.name}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {roleIcons[getRoles(currentUser)[0]] || <UserIcon size={14} className="text-slate-500" />}
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{currentUser.role.split(',').join(' • ')}</p>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('activity_points')}</span>
                <span className="text-sm font-black text-amber-500 tracking-tight">{currentUser.activityPoints?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* This space is intentionally left blank after removing the developer panel button */}

      <div className="space-y-4 relative z-10">
        <h3 className="text-[9px] font-black text-slate-400 mx-4 uppercase tracking-[0.4em]">{t('preferences')}</h3>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden divide-y divide-white/10 dark:divide-white/5">
          {hasRole(currentUser, 'developer') && (
            <div className="p-6">
              <label className="block text-sm font-black text-slate-800 dark:text-slate-200 uppercase mb-4">{t('font_family')}</label>
              <input 
                type="range" 
                min="10" 
                max="20" 
                value={config.fontSize || 12} 
                onChange={handleFontSizeChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>10px</span>
                <span>{config.fontSize || 12}px</span>
                <span>20px</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleShowLanguageModal} 
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Languages size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('language')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{language === 'ku' ? 'کوردی' : language === 'ar' ? 'العربية' : 'English'}</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>

          <button 
            onClick={handleShowSupportModal} 
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                <MessageSquare size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('technical_support')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t('send_request')}</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>

          {config.enableAccountsView !== false && (
            currentUser && hasRole(currentUser, ['VIP', 'VIP+', 'admin', 'developer', 'staff']) ? (
              <button 
                onClick={handleViewAccounts} 
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <DollarSign size={20} />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('accounts_transactions')}</p>
                    <p className="text-[10px] font-bold text-primary mt-0.5">{t('premium_ledger_feature')}</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-300" />
              </button>
            ) : (
              <button 
                onClick={() => setShowVipModal(true)} 
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-gradient-to-r from-amber-500/5 to-transparent"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 animate-pulse">
                    <Crown size={20} />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('buy_vip')}</p>
                    <p className="text-[10px] font-bold text-amber-500 mt-0.5">{t('get_features')}</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-300" />
              </button>
            )
          )}

          <button 
            onClick={handleViewFeatures} 
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Star size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('features')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t('about_app')}</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>
        </div>
      </div>

      {hasRole(currentUser, 'developer') && (
        <div className="space-y-4 relative z-10">
          <h3 className="text-[9px] font-black text-slate-400 mx-4 uppercase tracking-[0.4em]">{t('background_color')}</h3>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl p-6">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {[
                { name: 'Default', bg: '#0f172a', card: '#1e293b', text: '#f8fafc', primary: '#D4AF37' },
                { name: 'Gold', bg: '#1a1a1a', card: '#262626', text: '#D4AF37', primary: '#D4AF37' },
                { name: 'Black', bg: '#000000', card: '#111111', text: '#ffffff', primary: '#D4AF37' },
                { name: 'Emerald', bg: '#064e3b', card: '#065f46', text: '#ecfdf5', primary: '#10b981' },
                { name: 'Rose', bg: '#4c0519', card: '#831843', text: '#fff1f2', primary: '#f43f5e' },
                { name: 'Slate', bg: '#334155', card: '#475569', text: '#f8fafc', primary: '#38bdf8' },
                { name: 'Purple', bg: '#2e1065', card: '#4c1d95', text: '#f5f3ff', primary: '#a855f7' },
                { name: 'Coffee', bg: '#1c1917', card: '#292524', text: '#fafaf9', primary: '#d97706' },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetColorChange(preset)}
                  className={`shrink-0 w-12 h-12 rounded-2xl border-2 transition-all ${config.backgroundColor === preset.bg ? 'border-primary scale-110 shadow-lg' : 'border-transparent'} active:scale-95`}
                  style={{ backgroundColor: preset.bg }}
                  title={preset.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <h3 className="text-[9px] font-black text-slate-400 mx-4 uppercase tracking-[0.4em]">{t('app_info')}</h3>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden divide-y divide-white/10 dark:divide-white/5">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Info size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('version')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{config.appVersion || '1.0.0'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <UserIcon size={20} />
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('developer')}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Muhamad Rasmi</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-500/5">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                <Sparkles size={24} />
              </div>
              <div className="text-right">
                <p className="font-black text-xl text-slate-800 dark:text-slate-200 uppercase italic tracking-tighter">{t('install_instructions')}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">چۆن ئەپەکە بخەیتە سەر شاشەی سەرەکی</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-5 bg-white/60 dark:bg-slate-800/60 rounded-[2rem] border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black">iOS</div>
                  <p className="text-amber-500 font-black text-sm uppercase italic tracking-tighter">بۆ ئایفۆن:</p>
                </div>
                <div className="space-y-2 pr-2">
                  <p className="flex items-center gap-2"><span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px]">١</span> لە خوارەوەی بڕاوسەرەکە کلیک لە نیشانەی (Share) بکە.</p>
                  <p className="flex items-center gap-2"><span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px]">٢</span> کەمێک بڕۆ خوارەوە و کلیک لە (Add to Home Screen) بکە.</p>
                </div>
              </div>
              
              <div className="p-5 bg-white/60 dark:bg-slate-800/60 rounded-[2rem] border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black">AND</div>
                  <p className="text-blue-500 font-black text-sm uppercase italic tracking-tighter">بۆ ئەندرۆید:</p>
                </div>
                <div className="space-y-2 pr-2">
                  <p className="flex items-center gap-2"><span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px]">١</span> لە سەرەوەی لای ڕاست کلیک لە سێ خاڵەکە بکە.</p>
                  <p className="flex items-center gap-2"><span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px]">٢</span> کلیک لە (Install App) یان (Add to Home Screen) بکە.</p>
                </div>
              </div>
            </div>
          </div>
          {deferredPrompt && (
            <button 
              onClick={onInstall} 
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-amber-500/10"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600">
                  <Sparkles size={20} />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-slate-800 dark:text-slate-200 uppercase">{t('download_app')}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-0.5">کلیک لێرە بکە بۆ دابەزاندنی ڕاستەوخۆ</p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-slate-300" />
            </button>
          )}
        </div>
      </div>

      <button 
        onClick={onLogout} 
        className="w-full p-6 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/50 font-black text-xl uppercase tracking-widest active:scale-95 transition-all"
      >
        {t('logout')}
      </button>

      {/* VIP Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowVipModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-amber-500/20">
             <div className="text-center mb-8">
               <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/30 mb-4">
                 <Crown size={40} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('vip_membership')}</h2>
               <p className="text-amber-500 font-black text-lg mt-2">20,000 IQD / {t('lifetime')}</p>
             </div>

             <div className="space-y-4 mb-8">
               {[
                 'unlimited_product_registration',
                 'profit_loss_calculation',
                 'inventory_management',
                 '24_7_technical_support'
               ].map((feature, i) => (
                 <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                   <div className="p-1 bg-emerald-500 rounded-full text-white">
                     <Check size={12} strokeWidth={4} />
                   </div>
                   <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{t(feature)}</span>
                 </div>
               ))}
             </div>

             <div className="space-y-3">
               <button 
                 onClick={() => window.open('https://fib.iq', '_blank')}
                 className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <DollarSign size={24} />
                 {t('pay_with_fib')}
               </button>
               
               <button 
                 onClick={() => {
                   if (!currentUser) return;
                   const newTicket: SupportTicket = {
                     id: crypto.randomUUID(),
                     userId: currentUser.id,
                     userName: currentUser.name,
                     message: `${t('vip_activation_request')}\n\n${t('fib_payment_message')}\nMy Email: ${currentUser.email}\nMy ID: ${currentUser.id}`,
                     status: 'pending',
                     createdAt: new Date().toISOString(),
                     replies: [],
                     ticketNumber: 0
                   };
                   onAddSupportTicket(newTicket);
                   setShowVipModal(false);
                   alert('تیکێتەکەت بە سەرکەوتوویی نێردرا بۆ ئەدمین');
                 }}
                 className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <MessageSquare size={24} />
                 ناردنی تیکێت بۆ کڕین
               </button>

               <button 
                 onClick={() => {
                   const subject = encodeURIComponent(t('vip_activation_request'));
                   const body = encodeURIComponent(`${t('fib_payment_message')}\nMy Email: ${currentUser?.email}\nMy ID: ${currentUser?.id}`);
                   window.open(`mailto:emily@example.com?subject=${subject}&body=${body}`, '_blank');
                 }}
                 className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  <span className="truncate">{t('email_us')}</span>
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowLanguageModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
             <h2 className="text-2xl font-black text-center mb-8 dark:text-white uppercase italic tracking-tighter">{t('system_language')}</h2>
             <div className="space-y-3">
                {['ku', 'ar', 'en'].map(l => (
                  <button 
                    key={l} 
                    onClick={() => {setLanguage(l as LanguageCode); setShowLanguageModal(false);}} 
                    className={`w-full p-6 flex items-center justify-between rounded-2xl font-black transition-all ${language === l ? 'bg-primary text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 dark:text-white'}`}
                  >
                    <span className="text-base">{l === 'ku' ? 'کوردی' : l === 'ar' ? 'العربية' : 'English'}</span>
                    {language === l && <Check size={24} />}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
      
      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSupportModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{t('technical_support')}</h2>
               <button onClick={() => setShowSupportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
             </div>
             
             <div className="space-y-4">
               <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                 <Shield size={20} className="text-blue-500" />
                 <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                   ئەم داواکارییە ڕاستەوخۆ بۆ گەشەپێدەر دەنێردرێت
                 </p>
               </div>

               <textarea 
                 value={supportMessage}
                 onChange={(e) => setSupportMessage(e.target.value)}
                 placeholder={t('support_message_placeholder')}
                 className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
               />

               <div className="flex items-center gap-2">
                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={supportImageInputRef} 
                   onChange={handleSupportImageUpload} 
                   className="hidden" 
                 />
                 <button 
                    onClick={handleSupportImageClick}
                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                 >
                   <ImageIcon size={18} />
                   {supportImage ? 'وێنەکە گۆڕدرا' : 'وێنەیەک هاوپێچ بکە'}
                 </button>
                 {supportImage && (
                   <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                     <img src={supportImage} alt="Preview" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => setSupportImage(null)}
                       className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl-lg"
                     >
                       <X size={12} />
                     </button>
                   </div>
                 )}
               </div>

               <button 
                 onClick={handleSendSupport}
                 disabled={isSending || !supportMessage.trim()}
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
               >
                 {isSending ? (
                   <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     <Send size={20} />
                     {t('send_request')}
                   </>
                 )}
               </button>

               <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                 <h3 className="text-sm font-black dark:text-white uppercase italic tracking-tighter mb-4">{t('my_tickets') || 'My Tickets'}</h3>
                 <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                   {supportTickets
                     .filter(t => t.userId === currentUser?.id)
                     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                     .map(ticket => (
                       <div key={ticket.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                         <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-primary">#{ticket.ticketNumber}</span>
                           <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                             ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                           }`}>
                             {ticket.status}
                           </span>
                         </div>
                         <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{ticket.message}</p>
                         {ticket.replies && ticket.replies.map(reply => (
                           <div key={reply.id} className="mt-2 pl-4 border-l-2 border-primary/30 text-[9px] text-slate-500">
                             <span className="font-bold text-primary">{reply.userName}: </span>
                             {reply.message}
                           </div>
                         ))}
                         <input 
                           type="text" 
                           placeholder="Reply..." 
                           className="w-full p-2 mt-2 bg-white/5 border border-white/10 rounded-lg text-xs"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               onAddReplyToTicket(ticket.id, e.currentTarget.value);
                               e.currentTarget.value = '';
                             }
                           }}
                         />
                       </div>
                     ))}
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default SettingsView;
