import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  Newspaper, TrendingUp, 
  Shield, Check, Link as LinkIcon,
  RefreshCw, Smartphone
} from 'lucide-react';
import { Headline, AppConfig, User } from '../types.ts';

interface EditorDashboardProps {
  headlines: Headline[];
  onUpdateHeadlines: (newHeadlines: Headline[] | ((prev: Headline[]) => Headline[])) => void;
  t: (key: string) => string;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  currentUser: User;
}

const EditorDashboard: React.FC<EditorDashboardProps> = ({ 
  headlines, 
  onUpdateHeadlines, t,
  config, onUpdateConfig, currentUser
}) => {
  const [tab, setTab] = useState<'news'>('news');
  const availableTabs = [
    { id: 'news', label: t('headlines'), icon: Newspaper },
  ];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (item: any) => {
    setEditForm({ ...item });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    if (tab === 'news') {
      setEditForm({ text: '', active: true });
    }
  };

  const saveEdit = () => {
    if (!editForm) return;

    const now = new Date().toISOString();
    
    if (tab === 'news') {
      onUpdateHeadlines(prev => isAdding ? [{ ...editForm, id: `h_${Date.now()}`, date: now }, ...prev] : prev.map(h => h.id === editingId ? { ...editForm, date: now } : h));
      // Rates logic removed
    }
    setEditingId(null);
    setEditForm(null);
  };

  const deleteItem = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
    
    if (tab === 'news') onUpdateHeadlines(prev => prev.filter(x => x.id !== id));
  };

  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  // updateLocalRate removed




  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 mx-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
            <Edit3 size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor Status</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
              Active
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white uppercase italic tracking-tighter">
            <Edit3 size={24} className="text-primary" /> Editor Panel
          </h2>
        </div>
      </div>

      {/* Local update removed */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mx-2">
        <div className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar border border-white/20 dark:border-white/5 shadow-xl w-full md:w-auto">
          {availableTabs.map(tItem => (
            <button 
              key={tItem.id} 
              onClick={() => setTab(tItem.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${tab === tItem.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/10'}`}
            >
              <tItem.icon size={14} /> {tItem.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl w-full md:w-auto">
          <button 
            onClick={() => onUpdateConfig({...config, appPower: !config.appPower})}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${config.appPower ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'}`}
          >
            <div className={`w-3 h-3 rounded-full ${config.appPower ? 'bg-white' : 'bg-white'}`} />
            {config.appPower ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => onUpdateConfig({...config, notificationsEnabled: !config.notificationsEnabled})}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${config.notificationsEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/10'}`}
          >
            <Smartphone size={14} />
            {config.notificationsEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={startAdd} className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg">بڕگەی نوێ</button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 relative z-10">
        <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">بابەت</div>
          <div className="col-span-4 text-center">{tab === 'news' ? 'Status' : 'کڕین / فرۆشتن'}</div>
          <div className="col-span-3 text-center">کردار</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Rates tab removed */}
          {tab === 'news' && Array.isArray(headlines) && headlines.map(item => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
              <div className="col-span-9 pl-4">
                <div className="font-bold dark:text-white text-sm line-clamp-2">{item.text}</div>
                <div className="text-[9px] text-slate-400 mt-1">{new Date(item.date).toLocaleString()}</div>
              </div>
              <div className="col-span-3 flex justify-center gap-2">
                <button onClick={() => startEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
                <button onClick={() => deleteItem(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingId && editForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-app p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black dark:text-white uppercase italic">{isAdding ? 'بڕگەی نوێ' : 'دەستکاری'}</h3>
              <button onClick={() => setEditingId(null)} className="p-2 text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              {tab === 'news' ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">دەقی هەواڵ (News Text)</label>
                  <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary h-24" value={editForm.text || ''} onChange={e => setEditForm({...editForm, text: e.target.value})} />
                </div>
              ) : null}
              <button onClick={saveEdit} className="w-full bg-primary text-white py-3 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mt-2 transition-transform active:scale-95">
                <Check size={16}/> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorDashboard;
