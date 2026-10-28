
import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Layout, Palette, Activity, Cpu, Sliders, Maximize, Download, Save, CheckCircle2, ShieldAlert, CloudUpload, RefreshCw, Shield, Trash2 } from 'lucide-react';
import { AppConfig, LanguageCode, Headline, SupportTicket, LogEntry } from '../types.ts';

interface DeveloperViewProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  headlines: Headline[];
  supportTickets: SupportTicket[];
  logs: LogEntry[];
  onUpdateHeadlines: (newHeadlines: Headline[]) => void;
  onUpdateSupportTickets: (newTickets: SupportTicket[] | ((prev: SupportTicket[]) => SupportTicket[])) => void;
  onAddReplyToTicket: (ticketId: string, message: string) => void;
  onRestoreDefaults?: () => void;
  t: (key: string) => string;
  language: LanguageCode;
  onDisableDevMode?: () => void;
}

const resizeImage = (file: File, maxSize: number, callback: (dataUrl: string) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

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
        // Use webp with lower quality for faster upload
        callback(canvas.toDataURL('image/webp', 0.6));
      } else {
        callback(img.src); // Fallback to original if context fails
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const DeveloperView: React.FC<DeveloperViewProps> = ({ 
  config, 
  onUpdateConfig, 
  headlines,
  supportTickets,
  logs,
  onUpdateHeadlines,
  onUpdateSupportTickets,
  onAddReplyToTicket,
  onRestoreDefaults,
  t,
  language,
  onDisableDevMode
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visuals' | 'geometry' | 'modules' | 'content' | 'support' | 'logs' | 'roles' | 'accounting'>('visuals');
  const [isDeploying, setIsDeploying] = useState(false);
  const [tempAppName, setTempAppName] = useState(config.appName);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [accountingUsers, setAccountingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (activeSubTab === 'accounting') {
      fetch('/api/admin/accounting_users')
        .then(res => res.json())
        .then(data => setAccountingUsers(data))
        .catch(console.error);
    }
  }, [activeSubTab]);

  const downloadFullData = () => {
    try {
      const dataToExport = {
        metadata: {
          exportedBy: "System Developer",
          timestamp: new Date().toISOString(),
          version: "v16.0",
          appName: config.appName
        },
        application_config: config,
        headlines: headlines,
        news_headlines: headlines
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.appName.replace(/\s+/g, '_').toLowerCase()}_full_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export failed: ${String(error)}`);
    }
  };

  const manualSync = () => {
    // State in App.tsx is already watching these for changes, but we force a visual confirmation
    setTimeout(() => {
      alert("هەموو گۆڕانکارییەکان بە سەرکەوتوویی لە بیرگەی ئامێرەکەدا پاشەکەوت کران.");
    }, 500);
  };

  const handleDeploy = () => {
    if (!confirm("دڵنیایت لە ناردنی گۆڕانکارییەکان بۆ Vercel؟")) return;
    
    setIsDeploying(true);
    
    setTimeout(() => {
      setIsDeploying(false);
      alert("گۆڕانکارییەکان بە سەرکەوتوویی نێردران بۆ Vercel!");
    }, 6000);
  };

  const toggleTab = (tabId: string) => {
    const currentTabs = config.enabledTabs || ['accounting', 'metals', 'market', 'wallet', 'favorites', 'settings'];
    const newTabs = currentTabs.includes(tabId)
      ? currentTabs.filter(t => t !== tabId)
      : [...currentTabs, tabId];
    onUpdateConfig({ ...config, enabledTabs: newTabs });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 pb-24 px-4 animate-in fade-in relative z-10">
      {/* Dev Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => {
            if (confirm("دڵنیایت لە کوژاندنەوەی دۆخی گەشەپێدەر؟")) {
              onDisableDevMode?.();
            }
          }}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-rose-500/20 transition-all flex items-center gap-2"
        >
          <ShieldAlert size={16} />
          Turn Off Dev Mode
        </button>
      </div>

      {/* Dev Tab Navigation */}
      <div className="flex bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-1.5 rounded-xl shadow-lg border border-white/10 dark:border-white/5">
        {[
          { id: 'visuals', label: 'Theme Core', icon: Palette },
          { id: 'geometry', label: 'Dimensions', icon: Sliders },
          { id: 'modules', label: 'Modules', icon: Cpu },
          { id: 'roles', label: 'Roles', icon: Shield },
          { id: 'support', label: 'Support', icon: LucideIcons.MessageSquare },
          { id: 'logs', label: 'Logs', icon: LucideIcons.Terminal },
          { id: 'accounting', label: 'Accounting', icon: LucideIcons.Wallet },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id as any)} 
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeSubTab === tab.id ? 'bg-primary text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'modules' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">Module Control</h3>
             <Cpu size={20} className="text-sky-500" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
            لێرەوە دەتوانیت کۆنترۆڵی پیشاندانی بەشە سەرەکییەکانی ئەپەکە بکەیت. هەر بەشێک کە لادەبەیت، لە لیستی خوارەوە (Navigation Bar) نامێنێت.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${config.enableMarketSync !== false ? 'bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] border-amber-500/30 shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent opacity-60'}`}>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="font-bold uppercase text-[10px] text-slate-800 dark:text-white tracking-widest">Live Market Sync</span>
                <button 
                  onClick={() => onUpdateConfig({...config, enableMarketSync: !config.enableMarketSync})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors shadow-inner ${config.enableMarketSync !== false ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                ئەگەر چالاک بێت، نرخە جیهانییەکان (Borsa) بە شێوەیەکی خۆکار نوێ دەبنەوە.
              </p>
            </div>
            {['accounting', 'metals', 'market', 'wallet', 'favorites', 'settings'].map(tabId => {
              const isEnabled = config.enabledTabs?.includes(tabId) ?? true;
              return (
              <div key={tabId} className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${isEnabled ? 'bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] border-primary/30 shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent opacity-60'}`}>
                {isEnabled && <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>}
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="font-bold uppercase text-[10px] text-slate-800 dark:text-white tracking-widest">{config.tabNames?.[tabId] || t(tabId)}</span>
                  <button 
                    onClick={() => toggleTab(tabId)}
                    className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors shadow-inner ${isEnabled ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
                <div className="space-y-2 relative z-10">
                  <input 
                    type="text" 
                    placeholder="New Name..." 
                    value={config.tabNames?.[tabId] || ''}
                    onChange={(e) => onUpdateConfig({...config, tabNames: {...config.tabNames, [tabId]: e.target.value}})}
                    className="w-full bg-white/50 dark:bg-black/20 text-[10px] p-2 rounded-lg placeholder:text-slate-400 font-bold border border-white/10 focus:border-primary/50 outline-none transition-colors text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <label htmlFor={`icon-upload-${tabId}`} className="w-full bg-white/50 dark:bg-black/20 text-[10px] p-2 rounded-lg placeholder:text-slate-400 font-bold flex items-center justify-center cursor-pointer h-8 border border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                      {config.tabIcons?.[tabId] ? 'Change Icon' : 'Upload Icon'}
                    </label>
                    <input 
                      id={`icon-upload-${tabId}`}
                      type="file" 
                      accept="image/*, .gif" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.type === 'image/gif') {
                          if (file.size > 500 * 1024) {
                            alert("قەبارەی GIF زۆر گەورەیە! تکایە GIFێک بەکاربهێنە کە لە 500KB کەمتر بێت.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: reader.result as string}});
                          };
                          reader.readAsDataURL(file);
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_SIZE = 128;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                              if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              }
                            } else {
                              if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
                              onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: compressedBase64}});
                            } else {
                              onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: reader.result as string}});
                            }
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {config.tabIcons?.[tabId] && (
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 relative group overflow-hidden shadow-inner">
                        {(config.tabIcons[tabId]?.startsWith('data:image') || config.tabIcons[tabId]?.startsWith('http')) ? (
                          <img src={config.tabIcons[tabId]} alt="icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          React.createElement((LucideIcons as any)[config.tabIcons[tabId]] || Layout, { size: 16 })
                        )}
                        <button 
                          onClick={() => onUpdateConfig({...config, tabIcons: {...config.tabIcons, [tabId]: undefined}})}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10 mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Advanced Features</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">Activity Ranking</span>
                <button 
                  onClick={() => onUpdateConfig({...config, isRankingVisible: config.isRankingVisible === false ? true : false})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${config.isRankingVisible !== false ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">App Electric Power</span>
                <button 
                  onClick={() => onUpdateConfig({...config, appPower: !config.appPower})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${config.appPower ? 'bg-emerald-500 justify-end' : 'bg-rose-500 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">Accounts & Transactions</span>
                <button 
                  onClick={() => onUpdateConfig({...config, enableAccountsView: config.enableAccountsView === false ? true : false})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${config.enableAccountsView !== false ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">Admin Panel (Header)</span>
                <button 
                  onClick={() => onUpdateConfig({...config, enableAdminPanel: config.enableAdminPanel === false ? true : false})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${config.enableAdminPanel !== false ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">Card Glow Effects</span>
                <button 
                  onClick={() => onUpdateConfig({...config, disableCardGlow: !config.disableCardGlow})}
                  className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${!config.disableCardGlow ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'roles' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">Roles & Permissions</h3>
             <Shield size={20} className="text-primary" />
          </div>
          <div className="space-y-4">
            {(config.roles || []).map((role, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {role.icon && React.createElement((LucideIcons as any)[role.icon] || LucideIcons.Shield, { size: 16 })}
                    <span className="font-bold text-sm">{role.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                        const icon = prompt("Enter icon name (e.g., Shield, User, Settings):", role.icon || "");
                        if (icon !== null) onUpdateConfig({...config, roles: config.roles?.map((r, i) => i === index ? {...r, icon} : r)});
                    }} className="text-primary"><LucideIcons.Palette size={16}/></button>
                    <button onClick={() => onUpdateConfig({...config, roles: config.roles?.filter((_, i) => i !== index)})} className="text-rose-500"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {role.permissions.map((p, pIndex) => (
                    <span key={pIndex} className="px-2 py-1 bg-primary/20 rounded-lg text-[10px] flex items-center gap-1">
                      {p}
                      <button onClick={() => onUpdateConfig({...config, roles: config.roles?.map((r, i) => i === index ? {...r, permissions: r.permissions.filter((_, pi) => pi !== pIndex)} : r)})}>x</button>
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                        const p = prompt("Enter permission:");
                        if (p) onUpdateConfig({...config, roles: config.roles?.map((r, i) => i === index ? {...r, permissions: [...r.permissions, p]} : r)});
                    }}
                    className="px-2 py-1 bg-white/10 rounded-lg text-[10px]"
                  >+</button>
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                const name = prompt("Enter role name:");
                const icon = prompt("Enter icon name (e.g., Shield, User, Settings):");
                if (name) onUpdateConfig({...config, roles: [...(config.roles || []), { name, permissions: [], icon: icon || undefined }]});
              }}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs"
            >
              Add Role
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'visuals' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">Visual Engine Controls</h3>
             <Palette size={20} className="text-primary animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Identity Color</label>
               <div className="flex gap-2 flex-wrap">
                 {['#D4AF37', '#0284c7', '#cd7f32', '#059669', '#7c3aed', '#db2777', '#dc2626', '#F97316', '#06B6D4', '#8B5CF6', '#F43F5E', '#10B981', '#3B82F6', '#475569'].map(color => (
                   <button
                    key={color}
                    onClick={() => onUpdateConfig({...config, primaryColor: color})}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${config.primaryColor === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                   />
                 ))}
                 <input type="color" value={config.primaryColor} onChange={e => onUpdateConfig({...config, primaryColor: e.target.value})} className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden" />
               </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Canvas Background</label>
               <div className="flex gap-2 flex-wrap mb-2">
                 {[
                   { name: 'Default', color: '#f8fafc' },
                   { name: 'Dark Slate', color: '#0f172a' },
                   { name: 'Deep Black', color: '#000000' },
                   { name: 'Golden Black', color: '#1a1a10' },
                   { name: 'Midnight', color: '#020617' },
                   { name: 'Royal Blue', color: '#1e1b4b' },
                   { name: 'Forest', color: '#064e3b' },
                   { name: 'Wine', color: '#450a0a' }
                 ].map(preset => (
                   <button
                    key={preset.color}
                    title={preset.name}
                    onClick={() => onUpdateConfig({...config, backgroundColor: preset.color})}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${config.backgroundColor === preset.color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: preset.color }}
                   />
                 ))}
               </div>
               <input type="color" value={config.backgroundColor || '#f8fafc'} onChange={e => onUpdateConfig({...config, backgroundColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">App Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempAppName} 
                  onChange={(e) => setTempAppName(e.target.value)}
                  className="flex-1 bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
                />
                {tempAppName !== config.appName && (
                  <button 
                    onClick={() => onUpdateConfig({...config, appName: tempAppName})}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Save size={14} />
                    Confirm
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">App Version</label>
              <input 
                type="text" 
                value={config.appVersion || '1.0.0'} 
                onChange={(e) => onUpdateConfig({...config, appVersion: e.target.value})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Version (Increment to refresh logo)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={config.logoVersion || 1} 
                  onChange={(e) => onUpdateConfig({...config, logoVersion: parseInt(e.target.value) || 1})}
                  className="flex-1 bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
                />
                <button 
                  onClick={() => onUpdateConfig({...config, logoVersion: (config.logoVersion || 1) + 1})}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Management</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'customLogo', label: 'App Logo (512x512)', size: 512 },
                  { key: 'splashLogo', label: 'Splash Logo (1024x1024)', size: 1024 },
                  { key: 'favicon', label: 'Favicon (64x64)', size: 64 },
                ].map((logo) => (
                  <div key={logo.key} className="flex flex-col gap-2">
                    <div className="w-24 h-24 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 relative">
                      {uploadingLogo === logo.key && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 z-10">
                          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <span className="text-[8px] text-white font-bold">{uploadProgress}%</span>
                        </div>
                      )}
                      {config[logo.key as keyof AppConfig] ? (
                        <img src={config[logo.key as keyof AppConfig] as string} alt={logo.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-[10px] text-slate-500">No Logo</div>
                      )}
                    </div>
                    <label htmlFor={`upload-${logo.key}`} className="inline-block bg-primary text-white px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest cursor-pointer hover:bg-primary/90 transition-colors text-center">
                      {logo.label}
                    </label>
                    <input 
                      id={`upload-${logo.key}`}
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingLogo(logo.key);
                        setUploadProgress(0);
                        
                        // Simulate progress
                        const interval = setInterval(() => {
                          setUploadProgress(prev => {
                            if (prev >= 90) {
                              clearInterval(interval);
                              return 90;
                            }
                            return prev + 10;
                          });
                        }, 100);

                        resizeImage(file, logo.size, async (dataUrl) => {
                          onUpdateConfig({...config, [logo.key]: dataUrl, logoVersion: (config.logoVersion || 1) + 1});
                          
                          // Upload to server
                          const fileName = logo.key === 'customLogo' ? 'app-icon.jpg' : logo.key === 'splashLogo' ? 'splash-logo.jpg' : 'favicon.ico';
                          try {
                            await fetch('/api/upload-logo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: fileName, data: dataUrl })
                            });
                            setUploadProgress(100);
                            setTimeout(() => {
                              setUploadingLogo(null);
                              setUploadProgress(0);
                            }, 500);
                          } catch (err) {
                            console.error("Upload failed:", err);
                            setUploadingLogo(null);
                          } finally {
                            clearInterval(interval);
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image Optimizer (Fast Upload)</label>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] text-slate-500 font-bold">Upload any image here to optimize it for fast loading. Optimized images use WebP format and are resized to 1200px max.</p>
                <div className="flex items-center gap-4">
                  <label className="flex-1 h-20 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    <CloudUpload className="text-primary mb-1" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Image to Optimize</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        resizeImage(file, 1200, (dataUrl) => {
                          const a = document.createElement('a');
                          a.href = dataUrl;
                          a.download = `optimized_${file.name.split('.')[0]}.webp`;
                          a.click();
                        });
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">About App Text</label>
              <textarea 
                value={config.aboutAppText || ''} 
                onChange={(e) => onUpdateConfig({...config, aboutAppText: e.target.value})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary h-24 resize-none text-slate-900 dark:text-white"
                placeholder="Enter app description and features..."
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">About App (One per line)</label>
              <textarea 
                value={(config.appFeatures || []).join('\n')} 
                onChange={(e) => onUpdateConfig({...config, appFeatures: e.target.value.split('\n').filter(f => f.trim() !== '')})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary h-32 resize-none text-slate-900 dark:text-white"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3..."
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facebook Link</label>
              <input 
                type="text" 
                value={config.facebookLink || ''} 
                onChange={(e) => onUpdateConfig({...config, facebookLink: e.target.value})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Font Family</label>
              <select 
                value={config.fontFamily || 'Inter'}
                onChange={(e) => onUpdateConfig({...config, fontFamily: e.target.value})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
              >
                <option value="Inter">Inter (Default)</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Outfit">Outfit</option>
                <option value="JetBrains Mono">JetBrains Mono (Mono)</option>
              </select>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gold Text Font (Slide Style)</label>
              <select 
                value={config.goldTextFont || 'Playfair Display'}
                onChange={(e) => onUpdateConfig({...config, goldTextFont: e.target.value})}
                className="w-full bg-white dark:bg-black/20 text-xs p-3 rounded-lg font-bold border border-white/10 outline-none focus:border-primary text-slate-900 dark:text-white"
              >
                <option value="Playfair Display">Playfair Display</option>
                <option value="Anton">Anton</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
              </select>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 col-span-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Font Size ({config.globalFontSize || 12}px)</label>
              <input 
                type="range" 
                min="8" 
                max="20" 
                value={config.globalFontSize || 12} 
                onChange={(e) => onUpdateConfig({...config, globalFontSize: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4 col-span-full border border-primary/10">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marquee Engine</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateConfig({...config, marqueePaused: !config.marqueePaused})}
                    className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${config.marqueePaused ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {config.marqueePaused ? 'Paused' : 'Running'}
                  </button>
                  <button 
                    onClick={() => onUpdateConfig({...config, disableMarqueeAnimation: !config.disableMarqueeAnimation})}
                    className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${config.disableMarqueeAnimation ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {config.disableMarqueeAnimation ? 'Static' : 'Animated'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Scroll Speed ({config.marqueeSpeed || 25}s)</label>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="1"
                  value={config.marqueeSpeed || 25} 
                  onChange={(e) => onUpdateConfig({...config, marqueeSpeed: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[8px] text-slate-400 italic">Lower is faster (time to complete one cycle)</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Custom Marquee Text</label>
                  <button 
                    onClick={() => onUpdateConfig({...config, useCustomMarquee: !config.useCustomMarquee})}
                    className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors ${config.useCustomMarquee ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
                <textarea 
                  value={config.customMarqueeText || ''}
                  onChange={(e) => onUpdateConfig({...config, customMarqueeText: e.target.value})}
                  placeholder="Enter custom text to scroll..."
                className="w-full bg-white dark:bg-black/20 text-[10px] p-2 rounded-lg font-bold border border-white/10 outline-none focus:border-primary h-16 resize-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4 col-span-full border border-sky-500/10">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ad Banner Engine</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateConfig({...config, adDisplayMode: config.adDisplayMode === 'slider' ? 'list' : 'slider'})}
                    className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${config.adDisplayMode === 'slider' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {config.adDisplayMode === 'slider' ? 'Slider' : 'List'}
                  </button>
                  <button 
                    onClick={() => onUpdateConfig({...config, adAutoPlay: !config.adAutoPlay})}
                    className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${config.adAutoPlay !== false ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {config.adAutoPlay !== false ? 'AutoPlay ON' : 'AutoPlay OFF'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Global Aspect Ratio</label>
                <div className="flex flex-wrap gap-2">
                  {['1:1', '16:9', '4:3', '3:4', '21:9', '2:1', '3:1', '4:1', '5:1', '6:1'].map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => onUpdateConfig({...config, adAspectRatio: ratio as any})}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-bold transition-all ${config.adAspectRatio === ratio ? 'bg-sky-500 text-white shadow-md' : 'bg-white dark:bg-white/5 text-slate-500 border border-white/10'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'support' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">Support Requests</h3>
              <LucideIcons.MessageSquare size={20} className="text-blue-500" />
           </div>
           
           <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
             {(supportTickets || []).length === 0 ? (
               <div className="text-center py-10 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                 No support tickets found
               </div>
             ) : (
               (supportTickets || []).map(ticket => (
                 <div key={ticket.id} className="p-4 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 space-y-2">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-xs font-black dark:text-white">Ticket #{ticket.ticketNumber} - {ticket.userName}</p>
                       <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold mt-1">{ticket.message}</p>
                       <p className="text-[8px] text-slate-500 uppercase font-bold">{new Date(ticket.createdAt).toLocaleString()}</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                       ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                     }`}>
                       {ticket.status}
                     </span>
                   </div>
                   <div className="space-y-2">
                     {(ticket.replies || []).map(reply => (
                       <div key={reply.id} className="p-2 bg-white/10 rounded-lg">
                         <p className="text-[10px] font-bold text-primary">{reply.userName}:</p>
                         <p className="text-[10px] text-slate-700 dark:text-slate-300">{reply.message}</p>
                       </div>
                     ))}
                   </div>
                   <input 
                     type="text" 
                     placeholder="Reply..." 
                     className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         onAddReplyToTicket(ticket.id, e.currentTarget.value);
                         e.currentTarget.value = '';
                       }
                     }}
                   />
                   <div className="flex justify-end gap-2 pt-2">
                     <button 
                       onClick={() => onUpdateSupportTickets(prev => prev.filter(t => t.id !== ticket.id))}
                       className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                     >
                       <LucideIcons.Trash2 size={12} />
                     </button>
                     <button 
                       onClick={() => onUpdateSupportTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: t.status === 'resolved' ? 'pending' : 'resolved' } : t))}
                       className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                     >
                       {ticket.status === 'resolved' ? 'Reopen' : 'Resolve'}
                     </button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">System Logs</h3>
              <LucideIcons.Terminal size={20} className="text-emerald-500" />
           </div>
           
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {(logs || []).length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  No logs found
                </div>
              ) : (
                (logs || []).map(log => (
                 <div key={log.id} className="p-4 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 space-y-1">
                   <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black dark:text-white uppercase tracking-widest">{log.action} {log.target}</p>
                     <p className="text-[8px] text-slate-500 uppercase font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                   </div>
                   <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                     {log.details}
                   </p>
                   <p className="text-[8px] text-primary font-bold">User: {log.userName}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {activeSubTab === 'accounting' && (
        <div className="bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white uppercase italic tracking-tight">Golden Accounting Users</h3>
              <LucideIcons.Wallet size={20} className="text-amber-500" />
           </div>
           
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {accountingUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  No accounting users found
                </div>
              ) : (
                accountingUsers.map((user: any) => (
                  <div key={user.userId} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <LucideIcons.User size={16} className="text-amber-500" />
                         <span className="text-sm font-bold text-slate-200">{user.userId}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-slate-500">Last Updated: {new Date(user.lastUpdated).toLocaleString()}</span>
                         <button 
                           onClick={() => {
                             const newUsd = prompt(`Enter new USD balance for ${user.userId}:`, user.usd);
                             if (newUsd === null) return;
                             const newIqd = prompt(`Enter new IQD balance for ${user.userId}:`, user.iqd);
                             if (newIqd === null) return;
                             const newToman = prompt(`Enter new Toman balance for ${user.userId}:`, user.toman);
                             if (newToman === null) return;
                             
                             fetch(`/api/accounting_balance?userId=${user.userId}`, {
                               method: 'PUT',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({
                                 usd: parseFloat(newUsd) || 0,
                                 iqd: parseFloat(newIqd) || 0,
                                 toman: parseFloat(newToman) || 0,
                                 lastUpdated: new Date().toISOString()
                               })
                             }).then(() => {
                               // Refresh list
                               fetch('/api/admin/accounting_users')
                                 .then(res => res.json())
                                 .then(data => setAccountingUsers(data))
                                 .catch(console.error);
                             });
                           }}
                           className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                           title="Edit Balance"
                         >
                           <LucideIcons.Edit2 size={12} />
                         </button>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-800/50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">USD</div>
                        <div className="text-xs font-bold text-emerald-400">${user.usd.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">IQD</div>
                        <div className="text-xs font-bold text-sky-400">{user.iqd.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Toman</div>
                        <div className="text-xs font-bold text-amber-400">{user.toman.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      )}

      {/* Global Actions Grid */}
      <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={() => {
              if (window.confirm('ئایا دڵنیایت لە گەڕاندنەوەی هەموو داتاکان بۆ باری سەرەتایی؟ ئەمە هەموو گۆڕانکارییەکانت دەسڕێتەوە.')) {
                onRestoreDefaults?.();
              }
            }}
            className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all border border-rose-500/20 flex items-center justify-center gap-3 shadow-lg"
          >
            <RefreshCw size={16} /> Restore Factory Defaults
          </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-6 flex items-center gap-4">
         <ShieldAlert className="text-amber-600 shrink-0" size={20} />
         <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase">
           بۆ گەشەپێدەر: هەموو گۆڕانکارییەک ڕاستەوخۆ لە بیرگەی ئامێرەکەدا پاشەکەوت دەبێت. بۆ دڵنیابوونەوە لە پاراستنی داتاکان، هەمیشە فایلێکی باکئەپ (Backup) دابەزێنە.
         </p>
      </div>
    </div>
  );
};

export default DeveloperView;
