import { CurrencyRate, AppConfig } from '../types.ts';
import { Star, TrendingUp, Activity } from 'lucide-react';

interface FavoritesViewProps {
  rates: CurrencyRate[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  t: (key: string) => string;
  config: AppConfig;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ 
  rates, favorites, toggleFavorite, t, config 
}) => {
  const favoriteRates = rates.filter(r => favorites.includes(r.id));

  const isEmpty = favoriteRates.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto px-2 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
          <Star size={28} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
          {t('favorites') || 'Favorites'}
        </h2>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
          <Star size={60} className="text-slate-200 dark:text-slate-800 mb-4" />
          <p className="font-black text-sm uppercase tracking-widest text-slate-400">
            {t('no_favorites') || 'No favorites yet'}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">
            Click the star icon on any item to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Currencies */}
          {favoriteRates.length > 0 && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest px-2">
                <TrendingUp size={16} /> {t('currencies')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteRates.map(rate => (
                  <div key={rate.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group hover:shadow-lg transition-all">
                    <button 
                      onClick={() => toggleFavorite(rate.id)}
                      className="absolute top-4 left-4 text-rose-500 hover:scale-110 transition-transform"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                    <div className="flex items-center gap-4 mb-4 pl-8">
                      <img src={rate.flag} alt={rate.code} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">{rate.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{rate.code}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-center flex-1 border-l border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">{t('buy')}</p>
                        <p className="text-lg font-black text-emerald-500">{(rate.buy || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">{t('sell')}</p>
                        <p className="text-lg font-black text-rose-500">{(rate.sell || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
