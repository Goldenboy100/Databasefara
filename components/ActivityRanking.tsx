import React, { useState, useMemo, useCallback } from 'react';
import { User, AppConfig } from '../types.ts';
import { Trophy, User as UserIcon, Plus, Edit3, Save } from 'lucide-react';
import { hasRole } from '../utils.ts';

interface ActivityRankingProps {
  users: User[];
  onlineUsers: string[];
  currentUser: User | null;
  onUpdateUsers: (newUsers: User[] | ((prev: User[]) => User[])) => void;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

const ActivityRanking: React.FC<ActivityRankingProps> = React.memo(({ users, onlineUsers, currentUser, onUpdateUsers, config, onUpdateConfig }) => {
  if (!config.isRankingVisible) return null;
  const [isEditing, setIsEditing] = useState(false);

  const rankedUsers = useMemo(() => [...users].sort((a, b) => (b.activityPoints || 0) - (a.activityPoints || 0)), [users]);
  
  const addPoints = useCallback((userId: string, points: number) => {
    if (!hasRole(currentUser, 'developer')) return;
    onUpdateUsers(prev => prev.map(u => u.id === userId ? { ...u, activityPoints: (u.activityPoints || 0) + points } : u));
  }, [currentUser, onUpdateUsers]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateConfig({ ...config, bannerImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [config, onUpdateConfig]);

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 p-6">
      {/* Banner Section */}
      <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 border-4 border-amber-200/50 shadow-[0_20px_50px_rgba(217,119,6,0.3)] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)] opacity-50"></div>
        
        {hasRole(currentUser, 'developer') && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 z-10 transition-all"
          >
            {isEditing ? <Save size={18} className="text-white" /> : <Edit3 size={18} className="text-white" />}
          </button>
        )}
        
        {isEditing ? (
          <div className="space-y-3 text-left relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/70 uppercase tracking-widest px-1">Banner Title</label>
              <input value={config.bannerTitle || ''} onChange={e => onUpdateConfig({...config, bannerTitle: e.target.value})} className="w-full p-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/30 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/70 uppercase tracking-widest px-1">Banner Image</label>
              <div className="flex gap-2">
                <input value={config.bannerImage || ''} onChange={e => onUpdateConfig({...config, bannerImage: e.target.value})} className="flex-1 p-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-[10px] border border-white/30 outline-none" placeholder="Image URL" />
                <label className="p-2 bg-white/20 rounded-xl cursor-pointer hover:bg-white/30 transition-all">
                  <Plus size={16} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/70 uppercase tracking-widest px-1">Subtitle</label>
              <input value={config.bannerSubtitle || ''} onChange={e => onUpdateConfig({...config, bannerSubtitle: e.target.value})} className="w-full p-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/30 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/70 uppercase tracking-widest px-1">Value</label>
              <input value={config.bannerValue || ''} onChange={e => onUpdateConfig({...config, bannerValue: e.target.value})} className="w-full p-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/30 outline-none" />
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="text-white font-black text-2xl mb-4 drop-shadow-lg tracking-tighter">{config.bannerTitle}</div>
            <div className="relative mx-auto w-full max-w-[280px] aspect-[16/9] mb-4 group-hover:scale-105 transition-transform duration-500">
              <img 
                src={config.bannerImage} 
                alt="Banner" 
                className="w-full h-full object-cover rounded-2xl border-2 border-white/40 shadow-2xl"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]"></div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{config.bannerSubtitle}</div>
              <div className="text-white font-black text-3xl tracking-tighter drop-shadow-md">{config.bannerValue}</div>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-xl font-black dark:text-white uppercase italic mb-6 flex items-center gap-2">
        <Trophy className="text-amber-500" /> ڕیزبەندی چالاکترین بەکارهێنەران
      </h2>
      <div className="space-y-3">
        {rankedUsers.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 dark:bg-white/[0.02] rounded-2xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-white'}`}>
                {index + 1}
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-black uppercase text-lg border border-white/10 overflow-hidden">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <UserIcon size={24} />}
                </div>
                {onlineUsers.includes(user.id) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-lg"></div>
                )}
              </div>
              <div>
                <div className="font-black dark:text-white">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {onlineUsers.includes(user.id) ? 'Online' : 'Offline'} • {user.role}
                </div>
              </div>
            </div>
            <div className="text-xl font-black text-primary flex items-center gap-2">
              {user.activityPoints || 0} <span className="text-xs">خاڵ</span>
              {hasRole(currentUser, 'developer') && (
                <button onClick={() => addPoints(user.id, 10)} className="p-1 bg-primary text-white rounded-full hover:bg-primary/80">
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ActivityRanking;
