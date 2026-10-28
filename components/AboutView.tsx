
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Sparkles, Cpu, Facebook, Crown, Star, Phone, MessageSquare, X, Image as ImageIcon } from 'lucide-react';
import { AppConfig, User, SupportTicket } from '../types';

interface AboutViewProps {
  config: AppConfig;
  t: any;
  onBack: () => void;
  currentUser?: User | null;
  onAddSupportTicket?: (ticket: SupportTicket) => void;
}

const AboutView: React.FC<AboutViewProps> = ({ config, t, onBack, currentUser, onAddSupportTicket }) => {
  const features = config.appFeatures || [];

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportImage, setSupportImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const supportImageInputRef = useRef<HTMLInputElement>(null);

  const handleSupportImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('image_too_large') || 'Image too large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  const handleSendSupport = React.useCallback(async () => {
    if (!supportMessage.trim() || !currentUser || !onAddSupportTicket) return;
    setIsSending(true);
    
    const newTicket: SupportTicket = {
      id: crypto.randomUUID(),
      ticketNumber: 0, // Will be set by App.tsx
      userId: currentUser.id,
      userName: currentUser.name,
      message: supportMessage,
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

  const handleSupportImageClick = () => {
    supportImageInputRef.current?.click();
  };

  const vipFeatures = [
    t('vip_feature_no_ads') || 'بێ ڕیکلام (No Ads)',
    t('vip_feature_notifications') || 'ئاگادارکردنەوەی خێرا (Instant Notifications)',
    t('vip_feature_support') || 'پشتیوانی تایبەت (Priority Support)',
    t('vip_feature_calculator') || 'بژمێری پێشکەوتوو (Advanced Calculator)'
  ];

  const vipPlusFeatures = [
    t('vip_plus_accounting') || 'سیستەمی ژمێریاری زێڕین (Golden Accounting)',
    t('vip_plus_reports') || 'ڕاپۆرتی پێشکەوتوو (Advanced Reports)',
    t('vip_plus_data') || 'داتای تایبەت و پارێزراو (Private Data Isolation)',
    t('vip_plus_exchange') || 'ئاڵوگۆڕی خێرا (Quick Exchange)'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {t('features')} / {t('about')}
        </h1>
        <div className="w-11" /> {/* Spacer */}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Cpu className="text-primary w-8 h-8" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
            {t('about_app')}
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center whitespace-pre-wrap leading-relaxed">
            {config.aboutAppText || 'دروست کراوە لەلایەن محمد ڕەسمی'}
          </p>
          
          {config.facebookLink && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex justify-center pt-2"
            >
              <a 
                href={config.facebookLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Facebook size={18} />
                <span>Facebook</span>
              </a>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
          
          {/* Standard Features */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Sparkles className="text-slate-600 dark:text-slate-300" size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t('standard_features') || 'Standard'}
              </h2>
            </div>
            <div className="space-y-3">
              {features.length > 0 ? (
                features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-tight">
                      {feature}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 font-bold italic text-sm">{t('no_data')}</div>
              )}
            </div>
          </div>

          {/* VIP Features */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-3xl border border-indigo-500/20 space-y-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Star className="text-indigo-500" size={20} />
              </div>
              <h2 className="text-lg font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">
                VIP
              </h2>
            </div>
            <div className="space-y-3 relative z-10">
              {vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                  <span className="text-indigo-900 dark:text-indigo-200 font-bold text-sm leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 relative z-10">
              <button 
                onClick={() => setShowSupportModal(true)}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Star size={18} />
                {t('buy_vip') || 'Buy VIP'}
              </button>
            </div>
          </div>

          {/* VIP+ Features */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-3xl border border-amber-500/20 space-y-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Crown className="text-amber-500" size={20} />
              </div>
              <h2 className="text-lg font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                VIP+
              </h2>
            </div>
            <div className="space-y-3 relative z-10">
              {vipPlusFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-amber-900 dark:text-amber-200 font-bold text-sm leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 relative z-10">
              <button 
                onClick={() => setShowSupportModal(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Crown size={18} />
                {t('buy_vip') || 'Buy VIP'}
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {t('version')}: {config.appVersion || '1.0.0'}
      </div>

      {/* Support Modal for VIP Purchase */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSupportModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{t('buy_vip') || 'Buy VIP'}</h2>
               <button onClick={() => setShowSupportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
             </div>
             
             <div className="space-y-6">
               <div className="text-center space-y-2">
                 <p className="text-slate-600 dark:text-slate-300 font-bold">
                   بۆ کڕینی هەژماری VIP یان VIP+ دەتوانیت پەیوەندی بکەیت بەم ژمارەیەوە یان تیکتێک بکەیتەوە.
                 </p>
                 <a href="tel:07519055494" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg transition-colors shadow-lg shadow-emerald-500/20 mt-4">
                   <Phone size={24} />
                   <span dir="ltr">0751 905 5494</span>
                 </a>
               </div>

               <div className="relative flex items-center py-2">
                 <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                 <span className="flex-shrink-0 mx-4 text-slate-400 font-bold text-sm uppercase tracking-widest">{t('or') || 'یان'}</span>
                 <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
               </div>

               <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">کردنەوەی تیکت</p>
                 <textarea 
                   value={supportMessage}
                   onChange={(e) => setSupportMessage(e.target.value)}
                   placeholder={t('write_message') || 'Write your message here...'}
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32"
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
                     {supportImage ? (t('image_attached') || 'Image Attached') : (t('attach_image') || 'Attach Image')}
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
                   disabled={!supportMessage.trim() || isSending || !currentUser}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                 >
                   <MessageSquare size={20} />
                   {isSending ? (t('sending') || 'Sending...') : (t('send_request') || 'Send Request')}
                 </button>
                 {!currentUser && (
                   <p className="text-xs text-center text-rose-500 font-bold mt-2">
                     پێویستە هەژمارت هەبێت بۆ ناردنی تیکت.
                   </p>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutView;
