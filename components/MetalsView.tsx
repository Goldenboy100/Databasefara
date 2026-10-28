
import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Clock, Search, Filter, 
  Coins, Info, Star, Share2, ArrowRightLeft, 
  ChevronRight, Sparkles, Zap, Globe, Layers, Droplet, Flame
} from 'lucide-react';
import { MetalRate, AppConfig, LanguageCode, Ad } from '../types.ts';
import { TRANSLATIONS_INITIAL } from '../constants.ts';
import AdsBanner from './AdsBanner.tsx';

interface MetalsViewProps {
  rates: MetalRate[];
  config: AppConfig;
  language: LanguageCode;
  ads: Ad[];
  onToggleFavorite?: (id: string) => void;
  favorites?: string[];
}

const PriceDisplay = memo(({ price, unit, change, change24h }: { price: number, unit: string, change: string, change24h?: number }) => {
  const prevPriceRef = useRef(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price > prevPriceRef.current && prevPriceRef.current !== 0) {
      setFlash('up');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    } else if (price < prevPriceRef.current && prevPriceRef.current !== 0) {
      setFlash('down');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <div className="flex flex-col items-end relative">
      <motion.span 
        key={price}
        initial={flash ? { scale: 1.05, color: flash === 'up' ? '#10b981' : '#f43f5e' } : { scale: 1 }}
        animate={{ scale: 1, color: 'inherit' }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter drop-shadow-md"
      >
        {typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
      </motion.span>
      
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">
          {unit}
        </span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black ${
          change === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 
          change === 'down' ? 'text-rose-400 bg-rose-400/10' : 
          'text-slate-400 bg-slate-400/10'
        }`}>
          {change === 'up' ? '▲' : change === 'down' ? '▼' : '•'} {change24h ? `${Math.abs(change24h).toFixed(2)}%` : '0%'}
        </div>
      </div>

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

const MetalIcon = memo(({ symbol, category, config }: { symbol: string, category: string, config: any }) => {
  const getSolidIcon = () => {
    // Gold
    if (symbol === 'XAU') return <Coins className="text-yellow-500" size={32} />;
    // Silver
    if (symbol === 'XAG') return <Coins className="text-slate-400" size={32} />;
    // Platinum / Palladium / Metals
    if (['XPT', 'XPD', 'COP', 'ALU'].includes(symbol)) return <Layers className="text-slate-300" size={32} />;
    // Energy
    if (['OIL', 'WTI'].includes(symbol)) return <Droplet className="text-slate-900 dark:text-slate-200" size={32} />;
    if (symbol === 'GAS') return <Flame className="text-blue-500" size={32} />;
    
    return <Globe className="text-primary" size={32} />;
  };

  const getBgColor = () => {
    if (symbol === 'XAU') return 'bg-yellow-500/10 border-yellow-500/20';
    if (symbol === 'XAG') return 'bg-slate-400/10 border-slate-400/20';
    if (['OIL', 'WTI'].includes(symbol)) return 'bg-slate-900/10 dark:bg-white/10 border-slate-900/20 dark:border-white/20';
    if (symbol === 'GAS') return 'bg-blue-500/10 border-blue-500/20';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div className="relative shrink-0">
      {!config.disableCardGlow && (
         <div className={`absolute inset-0 bg-primary blur-xl opacity-10 rounded-full group-hover:opacity-30 transition-opacity`}></div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border relative z-10 shadow-inner transition-transform duration-500 group-hover:scale-110 ${getBgColor()}`}>
        {getSolidIcon()}
      </div>
    </div>
  );
});

const MetalsView: React.FC<MetalsViewProps> = memo(({ 
  rates, 
  config, 
  language, 
  ads,
  onToggleFavorite,
  favorites = []
}) => {
  const [search, setSearch] = useState('');

  const t = config.translations[language] || TRANSLATIONS_INITIAL[language] || TRANSLATIONS_INITIAL['ku'];

  const filteredRates = useMemo(() => {
    return rates.filter(r => {
      return r.name.toLowerCase().includes(search.toLowerCase()) || 
             r.symbol.toLowerCase().includes(search.toLowerCase());
    });
  }, [rates, search]);

  return (
    <div 
      className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24"
      style={{ fontSize: `${config.globalFontSize || 12}px` }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-3 px-2 relative z-10">
        <div className="flex-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl flex items-center gap-3">
          <Sparkles className="text-yellow-500" size={20} />
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
            {t.metals_market || 'بۆرسەی کانزاکان'}
          </h2>
        </div>
        <div className="relative md:w-64">
          <input 
            type="text" 
            placeholder={t.search_borsa || 'گەڕان لە بۆرسە...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3 pr-10 rounded-2xl outline-none font-bold text-xs shadow-xl dark:text-white placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      {/* Ads Banner */}
      <AdsBanner ads={ads} config={config} />

      {/* Content Section */}
      <div className="space-y-4 relative z-10 px-2">
        {filteredRates.map((rate) => {
          const isFav = favorites.includes(rate.id);
          return (
            <div
              key={rate.id}
              className="grid grid-cols-12 p-4 items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all rounded-[2rem] border border-white/20 dark:border-white/5 group relative overflow-hidden shadow-xl"
            >
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 ${rate.category === 'gold' ? 'bg-yellow-500/5' : 'bg-slate-500/5'} rounded-full blur-3xl group-hover:opacity-100 transition-all duration-500`}></div>

              {/* Icon and Name Section (Start / Right side in RTL) */}
              <div className="col-span-7 flex items-center gap-4">
                <div className="relative shrink-0">
                  <MetalIcon symbol={rate.symbol} category={rate.category} config={config} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(rate.id); }}
                    className={`absolute -top-2 -right-2 p-1.5 rounded-full transition-all z-20 ${isFav ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Star size={14} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors">
                    {rate.name}
                  </h3>
                </div>
              </div>

              {/* Price Section (End / Left side in RTL) */}
              <div className="col-span-5 flex flex-col items-end">
                <PriceDisplay price={rate.price} unit={rate.unit} change={rate.change} change24h={rate.change24h} />
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-50 mt-1">
                  <Clock size={10} />
                  {rate.lastUpdated ? new Date(rate.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRates.length === 0 && (
          <div className="py-12 text-center opacity-40">
            <Search size={40} className="mx-auto mb-2" />
            <p className="font-black text-[10px] uppercase">{t.no_data || 'هیچ نرخێک نەدۆزرایەوە'}</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2">
         <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <Sparkles size={20} className="text-yellow-500" />
            <p className="text-[10px] font-black dark:text-white italic">Global Spot Prices Live</p>
         </div>
         <div className="bg-slate-900 p-3 rounded-xl flex items-center justify-center text-center shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {t.market_note || 'ئەم نرخانە تەنها بۆ زانیارییە و بە شێوەیەکی ڕاستەوخۆ لە بۆرسەی جیهانییەوە وەردەگیرێن.'}
            </p>
         </div>
      </div>
    </div>
  );
});

export default MetalsView;
