import React, { useState } from 'react';
import { Upload, Video, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Ad } from '../types';

interface AdsManagerProps {
  ads: Ad[];
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
}

const AdsManager: React.FC<AdsManagerProps> = React.memo(({ ads, setAds }) => {
  const [newAd, setNewAd] = useState({ 
    type: 'image' as 'image' | 'video', 
    url: '', 
    title: '', 
    description: '', 
    link: '',
    aspectRatio: '4:3' as '1:1' | '16:9' | '4:3' | '3:4' | '21:9' | '2:1' | '3:1' | '4:1' | '5:1' | '6:1'
  });

  const addAd = (file: File) => {
    if (file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
            setAds(prevAds => [...prevAds, { 
              id: Date.now().toString(), 
              type: 'image', 
              url: compressedDataUrl, 
              title: newAd.title || undefined,
              description: newAd.description || undefined,
              link: newAd.link || undefined,
              aspectRatio: newAd.aspectRatio
            }]);
          } else {
            setAds(prevAds => [...prevAds, { 
              id: Date.now().toString(), 
              type: 'image', 
              url: img.src, 
              title: newAd.title || undefined,
              description: newAd.description || undefined,
              link: newAd.link || undefined,
              aspectRatio: newAd.aspectRatio
            }]);
          }
          setNewAd({ ...newAd, title: '', description: '', link: '' });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAds(prevAds => [...prevAds, { 
          id: Date.now().toString(), 
          type: 'video', 
          url: reader.result as string, 
          title: newAd.title || undefined,
          description: newAd.description || undefined,
          link: newAd.link || undefined,
          aspectRatio: newAd.aspectRatio
        }]);
        setNewAd({ ...newAd, title: '', description: '', link: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteAd = (id: string) => {
    setAds(prevAds => prevAds.filter(ad => ad.id !== id));
  };

  const clearAllAds = () => {
    if (window.confirm('دڵنیایت لە سڕینەوەی هەموو ڕیکلامەکان؟')) {
      setAds([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black dark:text-white">بەڕێوەبردنی ڕیکلامەکان</h2>
        {ads.length > 0 && (
          <button 
            onClick={clearAllAds}
            className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            سڕینەوەی هەمووی
          </button>
        )}
      </div>
      
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-2xl space-y-6">
        <h3 className="font-black text-xl dark:text-white flex items-center gap-3">
          <Upload className="text-emerald-500" />
          زیادکردنی ڕیکلامی نوێ
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black dark:text-slate-400 uppercase tracking-widest mr-2">ناونیشانی ڕیکلام (Title - ئارەزوومەندانە)</label>
            <input 
              type="text"
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
              placeholder="ناونیشان بنووسە..."
              value={newAd.title}
              onChange={e => setNewAd({...newAd, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black dark:text-slate-400 uppercase tracking-widest mr-2">تێبینی ڕیکلام (Description - ئارەزوومەندانە)</label>
            <input 
              type="text"
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
              placeholder="تێبینی بنووسە..."
              value={newAd.description}
              onChange={e => setNewAd({...newAd, description: e.target.value})}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black dark:text-slate-400 uppercase tracking-widest mr-2">لینکی ڕیکلام (Link - ئارەزوومەندانە)</label>
            <input 
              type="text"
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
              placeholder="https://example.com"
              value={newAd.link}
              onChange={e => setNewAd({...newAd, link: e.target.value})}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black dark:text-slate-400 uppercase tracking-widest mr-2">قەبارەی ڕیکلام (Aspect Ratio)</label>
            <div className="flex flex-wrap gap-2">
              {['1:1', '16:9', '4:3', '3:4', '21:9', '2:1', '3:1', '4:1', '5:1', '6:1'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setNewAd({...newAd, aspectRatio: ratio as any})}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${newAd.aspectRatio === ratio ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black dark:text-slate-400 uppercase tracking-widest mr-2">هەڵبژاردنی وێنە یان ڤیدیۆ</label>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={(e) => e.target.files?.[0] && addAd(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="w-full p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 group-hover:border-emerald-500 transition-colors flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-black text-sm dark:text-white">کلیک بکە یان فایلەکە لێرە دابنێ</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Image or Video (Max 10MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ads.map(ad => (
          <div key={ad.id} className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="relative aspect-video overflow-hidden rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800">
              {ad.type === 'image' ? (
                <img src={ad.url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <video src={ad.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              )}
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                {ad.aspectRatio || '16:9'}
              </div>
            </div>
            <div className="px-2 flex-1 flex flex-col">
              <h4 className="font-black text-sm dark:text-white truncate">{ad.title || 'بێ ناونیشان'}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate mb-4">{ad.description || 'بێ تێبینی'}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {ad.type === 'image' ? 'وێنە' : 'ڤیدیۆ'}
                </span>
                <button 
                  onClick={() => deleteAd(ad.id)} 
                  className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                  title="سڕینەوەی ڕیکلام"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default AdsManager;
