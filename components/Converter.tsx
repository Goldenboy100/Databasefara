
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Repeat, ArrowRightLeft, Calculator, Copy, Share2, CheckCircle2, Globe, Coins } from 'lucide-react';
import { CurrencyRate } from '../types.ts';

interface ConverterProps {
  rates: CurrencyRate[];
  t: (key: string) => string;
}

const CurrencySelect = React.memo(({ value, onChange, label, t, groupedRates }: { value: string, onChange: (v: string) => void, label: string, t: (key: string) => string, groupedRates: Record<string, CurrencyRate[]> }) => (
  <div className="flex-1 w-full space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {label === t('from') ? <Coins size={12} className="text-amber-500"/> : <Globe size={12} className="text-primary"/>}
      {label}
    </label>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none cursor-pointer dark:text-white transition-all shadow-sm hover:shadow-md text-right"
      >
        <option value="IQD">🇮🇶 عێراقی (IQD)</option>
        <option value="USD">🇺🇸 دۆلار (USD)</option>
        
        {groupedRates.global.length > 0 && (
          <optgroup label="🌍 دراوە جیهانییەکان">
            {groupedRates.global.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
            ))}
          </optgroup>
        )}

        {groupedRates.local.length > 0 && (
          <optgroup label="🏘️ بازاڕی ناوخۆ">
            {groupedRates.local.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
            ))}
          </optgroup>
        )}
      </select>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
));

const Converter: React.FC<ConverterProps> = React.memo(({ rates, t }) => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('IQD');
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const groupedRates = useMemo(() => {
    const groups: Record<string, CurrencyRate[]> = {
      local: rates.filter(r => r.category === 'local'),
      global: rates.filter(r => r.category === 'global'),
    };
    return groups;
  }, [rates]);

  const calculate = useCallback(() => {
    const numAmount = parseFloat(amount) || 0;
    const fromRateObj = rates.find(r => r.code === fromCurrency || r.id === fromCurrency);
    const toRateObj = rates.find(r => r.code === toCurrency || r.id === toCurrency);

    // Helper to get Reference USD Rate (Baghdad or First Local)
    // We use this for converting Global <-> IQD
    const refUsdRate = rates.find(r => r.code === 'USD/IQD' && r.category === 'local') || { buy: 150000, sell: 151000 };
    const refUsdBuy = refUsdRate.buy / 100; // Price of 1 USD in IQD
    const refUsdSell = refUsdRate.sell / 100;

    let amountInIQD = 0;

    // --- STEP 1: CONVERT TO IQD ---
    if (fromCurrency === 'IQD') {
      amountInIQD = numAmount;
    } else if (fromCurrency === 'USD') {
      amountInIQD = numAmount * refUsdBuy;
    } else if (fromRateObj) {
      if (fromRateObj.category === 'local') {
        // Local rates are usually price of $100 in IQD
        amountInIQD = numAmount * (fromRateObj.buy / 100);
      } else if (fromRateObj.category === 'global') {
        // Global rates are X/USD (e.g. EUR/USD = 1.05)
        // Amount * Rate = Amount in USD
        // Amount in USD * Ref_USD_Buy = Amount in IQD
        amountInIQD = numAmount * fromRateObj.buy * refUsdBuy;
      }
    }

    // --- STEP 2: CONVERT IQD TO TARGET ---
    let finalResult = 0;

    if (toCurrency === 'IQD') {
      finalResult = amountInIQD;
    } else if (toCurrency === 'USD') {
      finalResult = amountInIQD / refUsdSell;
    } else if (toRateObj) {
      if (toRateObj.category === 'local') {
        finalResult = amountInIQD / (toRateObj.sell / 100);
      } else if (toRateObj.category === 'global') {
        // IQD -> USD -> Global
        const amountInUSD = amountInIQD / refUsdSell;
        finalResult = amountInUSD / toRateObj.sell;
      }
    }

    // Direct match override
    if (fromCurrency === toCurrency) finalResult = numAmount;

    setResult(finalResult);
  }, [amount, fromCurrency, toCurrency, rates]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const swap = useCallback(() => {
    setFromCurrency(prev => {
      const currentTo = toCurrency;
      setToCurrency(prev);
      return currentTo;
    });
  }, [toCurrency]);

  const handleCopy = useCallback(async () => {
    const text = `${amount} ${fromCurrency} = ${(result || 0).toLocaleString()} ${toCurrency}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [amount, fromCurrency, result, toCurrency]);

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-primary to-amber-500 animate-shimmer" />
        
        <div className="p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Calculator size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('converter')}</h2>
          </div>
          
          <div className="space-y-8">
            {/* Amount Input */}
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">
                {t('amount')}
              </label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-4xl font-black p-6 bg-white dark:bg-slate-800 rounded-3xl border-2 border-transparent focus:border-primary/20 focus:bg-primary/5 outline-none transition-all text-center dark:text-white shadow-inner"
                placeholder="0.00"
              />
            </div>

            {/* Currency Selectors */}
            <div className="flex flex-col gap-4 relative">
              <CurrencySelect 
                label={t('from')} 
                value={fromCurrency} 
                onChange={setFromCurrency} 
                t={t}
                groupedRates={groupedRates}
              />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <button 
                  onClick={swap}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>
              
              {/* Mobile Swap Button */}
               <div className="flex justify-center md:hidden -my-2 z-10">
                <button 
                  onClick={swap}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                >
                  <ArrowRightLeft className="rotate-90" size={18} />
                </button>
              </div>

              <CurrencySelect 
                label={t('to')} 
                value={toCurrency} 
                onChange={setToCurrency} 
                t={t}
                groupedRates={groupedRates}
              />
            </div>

            {/* Result Display */}
            <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 rounded-[2rem] p-8 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-primary/30 transition-all" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t('estimated_result')}</p>
                <h3 className="text-5xl font-black tracking-tighter drop-shadow-lg">
                  {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h3>
                <p className="text-sm font-black uppercase tracking-widest opacity-80">
                  {rates.find(r => r.code === toCurrency || r.id === toCurrency)?.code || toCurrency}
                </p>
              </div>

              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 px-4 py-2 rounded-xl text-[10px] font-black transition-all backdrop-blur-md"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-400 dark:text-emerald-600" /> : <Copy size={14} />}
                  {copied ? t('copied') : t('copy')}
                </button>
                <button className="flex items-center gap-2 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 px-4 py-2 rounded-xl text-[10px] font-black transition-all backdrop-blur-md">
                  <Share2 size={14} />
                  {t('share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 opacity-70">
          <Repeat size={12} />
          {t('market_note')}
        </p>
      </div>
    </div>
  );
});

export default Converter;
