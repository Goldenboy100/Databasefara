
import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Clock, Star, Info, Globe, Shield, Zap, Smartphone, Heart, Cpu, CheckCircle2, PlusCircle, Lock, Unlock, Crown } from 'lucide-react';
import { CurrencyRate, AppConfig, Headline, User, CryptoRate } from '../types.ts';
import { hasRole } from '../utils.ts';
import { Virtuoso } from 'react-virtuoso';

interface MarketViewProps {
  rates: CurrencyRate[];
  cryptoRates: CryptoRate[];
  headlines: Headline[];
  t: (key: string) => string;
  config: AppConfig;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  currentUser: User | null;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

const PriceDisplay = memo(({ value, label, t, formatRate, category }: { 
  value: number, 
  label: string, 
  t: (key: string) => string,
  formatRate: (value: number, category: string) => string,
  category: string
}) => {
  const prevValueRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    // Use a small threshold to trigger flash for jitter
    if (value > prevValueRef.current && prevValueRef.current !== 0) {
      setFlash('up');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    } else if (value < prevValueRef.current && prevValueRef.current !== 0) {
      setFlash('down');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center relative">
      <motion.span 
        key={value}
        initial={flash ? { scale: 1.05, color: flash === 'up' ? '#10b981' : '#f43f5e' } : { scale: 1 }}
        animate={{ scale: 1, color: 'inherit' }}
        transition={{ duration: 0.4 }}
        className={`text-2xl font-black tabular-nums tracking-tighter drop-shadow-md transition-colors ${label === 'sell' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
      >
        {formatRate(value, category)}
      </motion.span>
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-50">{t(label)}</span>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 blur-xl rounded-full -z-10 ${flash === 'up' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

const RateItem = memo(({ item, config, activeTab, isFavorite, toggleFavorite, t, formatRate }: { 
  item: any, 
  config: AppConfig, 
  activeTab: string, 
  isFavorite: boolean, 
  toggleFavorite: (id: string) => void, 
  t: (key: string) => string,
  formatRate: (value: number, category: string) => string
}) => {
  return (
    <div 
      className={`${config.cardDisplayMode === 'vertical' ? 'bg-white/5 dark:bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col gap-3' : 'grid grid-cols-12 p-6 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-3 mx-3 rounded-[2rem] border border-white/10 dark:border-white/5'} group relative overflow-hidden shadow-${config.cardShadow || 'md'} will-change-transform`}
      style={config.cardDisplayMode === 'vertical' ? { padding: `${config.cardPadding || 16}px` } : {}}
    >
      {/* Background Glow - Only if enabled */}
      {!config.disableCardGlow && (
         <div className={`absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:opacity-100 transition-all duration-500`}></div>
      )}
      
      <button 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
        className={`absolute top-4 left-4 p-2 rounded-full transition-all z-20 ${isFavorite ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
      >
        <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Lock Icon for local items */}
      {activeTab === 'local' && config.isLocalMarketLocked && (
        <div className="absolute top-4 right-4 text-rose-500 z-20">
          <Lock size={18} />
        </div>
      )}

      <div className={`${config.cardDisplayMode === 'vertical' ? 'flex items-center gap-3' : 'col-span-6 flex items-center gap-4 pl-8'}`}>
        <div className="relative shrink-0">
          {!config.disableCardGlow && (
             <div className={`absolute inset-0 bg-primary blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity`}></div>
          )}
          <img 
            src={item.flag || item.icon} 
            alt={item.code || item.symbol} 
            className="w-14 h-14 rounded-2xl object-cover shadow-2xl border border-white/20 relative z-10 group-hover:scale-110 transition-transform duration-500" 
            referrerPolicy="no-referrer" 
            loading="lazy"
            decoding="async"
          />
          {!config.disableCardGlow && (
             <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 z-20 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className={`text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors`}>{item.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border-white/5 uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-sm`}>{item.code || item.symbol}</span>
            {item.isPremium && (
              <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 border-amber-500/20 uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1">
                <Crown size={8} /> {t('premium')}
              </span>
            )}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black ${item.change24h && item.change24h > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
               {item.change24h && item.change24h > 0 ? '▲' : '▼'} {item.change24h ? `${Math.abs(item.change24h).toFixed(2)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {item.buy !== undefined && item.sell !== undefined ? (
        <>
          <div className={`${config.cardDisplayMode === 'vertical' ? 'flex justify-between items-center mt-2' : 'col-span-3 text-center flex flex-col items-center'}`}>
            <PriceDisplay value={item.buy} label="buy" t={t} formatRate={formatRate} category={item.category} />
          </div>

          <div className={`${config.cardDisplayMode === 'vertical' ? 'flex justify-between items-center' : 'col-span-3 text-center flex flex-col items-center'}`}>
            <PriceDisplay value={item.sell} label="sell" t={t} formatRate={formatRate} category={item.category} />
          </div>
        </>
      ) : (
        <div className={`${config.cardDisplayMode === 'vertical' ? 'flex justify-between items-center mt-2' : 'col-span-6 text-center flex flex-col items-center'}`}>
          <PriceDisplay value={item.price || 0} label="price" t={t} formatRate={formatRate} category={item.category} />
        </div>
      )}
    </div>
  );
});

const MarketView = memo(({ rates, cryptoRates, headlines, t, config, favorites, toggleFavorite, currentUser, onUpdateConfig }: MarketViewProps) => {
  const [activeTab, setActiveTab] = useState('local');
  const [search, setSearch] = useState('');
  const [showElectronicV2, setShowElectronicV2] = useState(false);

  const canToggleLock = hasRole(currentUser, ['admin', 'editor']);
  const isDev = hasRole(currentUser, 'developer');

  const toggleLock = useCallback(() => {
    onUpdateConfig({ ...config, isLocalMarketLocked: !config.isLocalMarketLocked });
  }, [config, onUpdateConfig]);

  const tabs = useMemo(() => {
    const base = [
      { id: 'local', label: t('market_local') },
      { id: 'global', label: t('market_global') }
    ];
    if (config.enableCryptoView) {
      base.push({ id: 'crypto', label: t('crypto') });
    }
    if (showElectronicV2) {
      base.push({ id: 'electronic_v2', label: t('electronic_v2') || 'Electronic V2' });
    }
    if (isDev) {
      base.push({ id: 'dev_tools', label: t('dev_tools') || 'Dev Tools' });
    }
    return base;
  }, [t, config.enableCryptoView, showElectronicV2, isDev]);

  // Ensure activeTab is valid when tabs change
  useEffect(() => {
    const tabExists = tabs.some(tab => tab.id === activeTab);
    if (!tabExists && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const filteredData = useMemo(() => {
    if (activeTab === 'crypto') {
      return cryptoRates.filter(r => 
        (r.name && r.name.toLowerCase().includes(search.toLowerCase())) || 
        (r.symbol && r.symbol.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return rates
      .filter(r => r.category === activeTab)
      .sort((a, b) => {
        if (a.name.includes('هەولێر')) return -1;
        if (b.name.includes('هەولێر')) return 1;
        return 0;
      })
      .filter(r => 
        (r.name && r.name.toLowerCase().includes(search.toLowerCase())) || 
        (r.code && r.code.toLowerCase().includes(search.toLowerCase()))
      );
  }, [rates, cryptoRates, activeTab, search]);

  const formatRate = useCallback((value: number, category: string) => {
    // Show decimals for global and crypto to make jitter visible
    if (category === 'global' || category === 'crypto' || activeTab === 'crypto' || activeTab === 'electronic_v2') {
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: category === 'crypto' ? 4 : 2 
      });
    }
    return value.toLocaleString();
  }, [activeTab]);

  const renderRateList = useCallback((items: any[]) => {
    if (activeTab === 'dev_tools') {
      return (
        <div className="p-8 space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-black text-amber-500 mb-2 flex items-center gap-2">
              <Cpu size={20} /> {t('dev_tools') || 'Dev Tools'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t('manage_experimental_features') || 'Manage experimental market features and sections.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setShowElectronicV2(!showElectronicV2);
                  if (!showElectronicV2) setActiveTab('electronic_v2');
                }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${showElectronicV2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${showElectronicV2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Zap size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{t('electronic_currency_v2') || 'Electronic Currency V2'}</div>
                    <div className="text-[10px] opacity-60">{t('enable_experimental_rates') || 'Enable experimental electronic rates'}</div>
                  </div>
                </div>
                {showElectronicV2 ? <CheckCircle2 size={20} /> : <PlusCircle size={20} />}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Virtuoso
        style={{ height: '600px' }}
        data={items}
        itemContent={(index, item) => (
          <RateItem 
            key={item.id}
            item={item}
            config={config}
            activeTab={activeTab}
            isFavorite={favorites.includes(item.id)}
            toggleFavorite={toggleFavorite}
            t={t}
            formatRate={formatRate}
          />
        )}
      />
    );
  }, [config, activeTab, canToggleLock, toggleLock, favorites, toggleFavorite, t, formatRate, showElectronicV2, setShowElectronicV2, setActiveTab]);

  return (
    <div 
      className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24"
      style={{ fontSize: `${config.globalFontSize || 12}px` }}
    >
      {/* Headlines Marquee */}
      {headlines.length > 0 && (
        <div className="mx-2 bg-slate-900 dark:bg-black rounded-xl overflow-hidden py-2 border border-white/5 shadow-lg relative group">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
          
          <div className="flex items-center gap-4">
            <div className="bg-primary px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest z-10 shadow-xl shrink-0">
              {t('reklam')}
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div 
                className={`${config.disableMarqueeAnimation ? '' : 'animate-marquee'} hover:[animation-play-state:paused] whitespace-nowrap flex gap-12 text-[11px] font-bold text-slate-300 italic cursor-default w-fit`}
                style={{
                  animationDuration: `${config.marqueeSpeed || 25}s`,
                  animationPlayState: config.marqueePaused ? 'paused' : undefined
                }}
              >
                <div className="flex gap-12 shrink-0">
                  {config.useCustomMarquee && config.customMarqueeText ? (
                    <span>{config.customMarqueeText}</span>
                  ) : (
                    headlines.filter(h => h.active).map(h => (
                      <span key={h.id}>• {h.text}</span>
                    ))
                  )}
                </div>
                
                {/* Duplicate for seamless loop - only if animating */}
                {!config.disableMarqueeAnimation && (
                  <div className="flex gap-12 shrink-0">
                    {config.useCustomMarquee && config.customMarqueeText ? (
                      <span>{config.customMarqueeText}</span>
                    ) : (
                      headlines.filter(h => h.active).map(h => (
                        <span key={`dup-${h.id}`}>• {h.text}</span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-3 px-2 relative z-10">
        <div className="flex-1 flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl overflow-x-auto no-scrollbar gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <input 
            type="text" 
            placeholder={t('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3 pr-10 rounded-2xl outline-none font-bold text-xs shadow-xl dark:text-white placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2">
          <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <div className="col-span-6">{t('currency')}</div>
            <div className="col-span-3 text-center">{t('buy')}</div>
            <div className="col-span-3 text-center">{t('sell')}</div>
          </div>
          {renderRateList(filteredData)}
        </div>

        {filteredData.length === 0 && (
          <div className="py-12 text-center opacity-40"><Activity size={40} className="mx-auto mb-2" /><p className="font-black text-[10px] uppercase">{t('no_data')}</p></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
         <div className="bg-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <Clock size={20} className="text-primary" />
            <p className="text-[10px] font-black dark:text-white italic">{t('last_update')}: {new Date().toLocaleTimeString('ku-IQ')}</p>
         </div>
         <div className="bg-slate-900 p-3 rounded-xl flex items-center justify-center text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{t('disclaimer')}</p>
         </div>
      </div>
    </div>
  );
});

export default MarketView;
