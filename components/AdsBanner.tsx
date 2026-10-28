import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Ad, AppConfig } from '../types';

interface AdsBannerProps {
  ads: Ad[];
  config: AppConfig;
}

const AdsBanner: React.FC<AdsBannerProps> = React.memo(({ ads, config }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(config.adAutoPlay !== false);

  const nextAd = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  const prevAd = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  useEffect(() => {
    if (!isAutoPlaying || ads.length <= 1) return;
    const interval = setInterval(nextAd, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, ads.length, nextAd]);

  const getAspectRatioStyle = useCallback((ratio?: string) => {
    const r = ratio || config.adAspectRatio || '4:3';
    switch (r) {
      case '1:1': return { aspectRatio: '1/1' };
      case '16:9': return { aspectRatio: '16/9' };
      case '4:3': return { aspectRatio: '4/3' };
      case '3:4': return { aspectRatio: '3/4' };
      case '21:9': return { aspectRatio: '21/9' };
      case '2:1': return { aspectRatio: '2/1' };
      case '3:1': return { aspectRatio: '3/1' };
      case '4:1': return { aspectRatio: '4/1' };
      case '5:1': return { aspectRatio: '5/1' };
      case '6:1': return { aspectRatio: '6/1' };
      default: return { aspectRatio: '4/3' };
    }
  }, [config.adAspectRatio]);

  const renderAdContent = useCallback((ad: Ad) => {
    const content = (
      <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl group bg-slate-100 dark:bg-slate-800">
        {/* Ad Badge */}
        <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
          ڕیکلام
        </div>

        {ad.type === 'image' ? (
          <img 
            src={ad.url} 
            alt={ad.title || 'Ad'} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            referrerPolicy="no-referrer" 
            draggable={false}
            loading="eager"
          />
        ) : (
          <video 
            src={ad.url} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            autoPlay 
            muted 
            loop 
            playsInline 
          />
        )}
        
        {/* Overlay for title/description if they exist */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 transition-opacity duration-300 ${!ad.title && !ad.description && !ad.link ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              {ad.title && <h4 className="text-white font-black text-xl md:text-2xl leading-tight mb-2 drop-shadow-lg">{ad.title}</h4>}
              {ad.description && <p className="text-white/80 text-xs md:text-sm font-bold line-clamp-2 drop-shadow-md">{ad.description}</p>}
            </div>
            {ad.link && (
              <div className="shrink-0">
                <span className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-colors shadow-lg">
                  بینین
                  <ExternalLink size={16} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (ad.link) {
      return (
        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full outline-none cursor-pointer">
          {content}
        </a>
      );
    }

    return content;
  }, []);

  if (ads.length === 0) return null;

  if (config.adDisplayMode === 'list') {
    return (
      <div className="px-4 md:px-12 pt-6 space-y-6">
        {ads.map(ad => (
          <div key={ad.id} className="w-full relative" style={getAspectRatioStyle(ad.aspectRatio)}>
            {renderAdContent(ad)}
          </div>
        ))}
      </div>
    );
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="px-4 md:px-12 pt-6 pb-2 relative group/banner sticky top-0 z-40 bg-slate-50 dark:bg-slate-950">
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ ...getAspectRatioStyle(currentAd.aspectRatio) }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(config.adAutoPlay !== false)}
          >
            {renderAdContent(currentAd)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {ads.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prevAd(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-all hover:bg-black/60 hover:scale-110 z-20 shadow-xl border border-white/10"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextAd(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-all hover:bg-black/60 hover:scale-110 z-20 shadow-xl border border-white/10"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default AdsBanner;
