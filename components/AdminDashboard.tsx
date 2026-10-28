
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Edit3, X, 
  Newspaper, TrendingUp, UserCog, Users, Layers,
  Shield, Check, Image as ImageIcon, Link as LinkIcon,
  RefreshCw, Smartphone, Database, ShieldAlert,
  Package, Tag, MessageSquare, Clock, Bell, Send, Bitcoin
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import * as LucideIcons from 'lucide-react';
import { User, Headline, AppConfig, SupportTicket } from '../types.ts';
import { hasRole, getRoles } from '../utils.ts';
// Removed INITIAL_RATES import

// Removed RateItem component


const NewsItem = React.memo(({ item, onEdit, onDelete }: { item: Headline, onEdit: (i: any) => void, onDelete: (id: string) => void }) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-9 pl-4">
      <div className="font-bold dark:text-white text-sm line-clamp-2">{item.text}</div>
      <div className="text-[9px] text-slate-400 mt-1">{item.date ? (() => { try { const d = new Date(item.date); return isNaN(d.getTime()) ? '' : d.toLocaleString(); } catch(e) { return ''; } })() : ''}</div>
    </div>
    <div className="col-span-3 flex justify-center gap-2">
      <button onClick={() => onEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
      <button onClick={() => onDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
    </div>
  </div>
));

const UserItem = React.memo(({ item, onlineUsers, currentUser, onEdit, onDelete, onToggleStatus, t }: { 
  item: User, 
  onlineUsers: string[], 
  currentUser: User, 
  onEdit: (i: any) => void, 
  onDelete: (id: string) => void,
  onToggleStatus: (u: User) => void,
  t: (key: string) => string
}) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-5 flex items-center gap-4 pl-4">
      <div className="relative">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-black uppercase text-lg border border-white/10 overflow-hidden">
          {item.avatar ? (
            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            (item.name || '').substring(0, 2)
          )}
        </div>
        {onlineUsers.includes(item.id) && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-lg" title="Online"></div>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-black dark:text-white text-sm truncate flex items-center gap-2">
          {item.name}
          {onlineUsers.includes(item.id) ? (
            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('online')}
            </span>
          ) : (
            <span className="text-[8px] bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {t('offline')}
            </span>
          )}
        </div>
        <div className="text-[9px] text-slate-400 font-bold truncate">{item.email}</div>
      </div>
    </div>
    <div className="col-span-4 text-center flex flex-col items-center justify-center gap-2">
      <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${hasRole(item, 'developer') ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{item.role.split(',').join(' • ')}</span>
      <div className="text-[10px] font-black text-primary">{item.activityPoints || 0} {t('points')}</div>
      <div className="text-[10px] font-black text-emerald-500">{(item.wallet?.balance || 0).toLocaleString()} {item.wallet?.currency || 'IQD'}</div>
      <button 
        onClick={() => onToggleStatus(item)}
        disabled={hasRole(item, 'developer')}
        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-sm ${
          item.status === 'approved' 
            ? 'bg-emerald-500 text-white hover:bg-rose-500' 
            : (item.status === 'pending' 
                ? 'bg-amber-500 text-white animate-pulse hover:bg-emerald-600' 
                : 'bg-rose-500 text-white hover:bg-emerald-600')
        }`}
      >
        {item.status === 'approved' ? t('approved') : (item.status === 'pending' ? t('approve_now') : t('unblock'))}
      </button>
    </div>
    <div className="col-span-3 flex justify-center gap-2">
      {(() => {
        const canEdit = hasRole(currentUser, 'developer') || (hasRole(currentUser, 'admin') && !hasRole(item, 'developer')) || (hasRole(currentUser, 'staff') && hasRole(item, 'user'));
        if (canEdit) return <button onClick={() => onEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>;
        return null;
      })()}
      {(() => {
        const canDelete = hasRole(currentUser, 'developer') || (hasRole(currentUser, 'admin') && !hasRole(item, 'developer') && !hasRole(item, 'admin'));
        if (canDelete && item.id !== currentUser.id) return <button onClick={() => onDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>;
        return null;
      })()}
    </div>
  </div>
));

const TransactionItem = React.memo(({ item, users, onEdit, onDelete, t }: { item: any, users: User[], onEdit: (i: any) => void, onDelete: (id: string) => void, t: (key: string) => string }) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-4 pl-4">
      <div className="font-black dark:text-white text-sm truncate">{item.itemName}</div>
      <div className="text-[9px] text-slate-400 font-bold uppercase">{item.type} • {item.customerName || t('no_customer')}</div>
    </div>
    <div className="col-span-3 text-center">
      <div className="text-sm font-black dark:text-white">{(item.total || 0).toLocaleString()} IQD</div>
      <div className="text-[9px] text-slate-400">{(item.amount || 0).toLocaleString()} x {(item.price || 0).toLocaleString()}</div>
    </div>
    <div className="col-span-3 text-center">
      <div className="text-[10px] text-slate-400 font-bold">{item.date ? (() => { try { const d = new Date(item.date); return isNaN(d.getTime()) ? '' : d.toLocaleString(); } catch(e) { return ''; } })() : ''}</div>
      <div className="text-[9px] text-primary font-black uppercase">{users.find(u => u.id === item.userId)?.name || t('unknown_user')}</div>
    </div>
    <div className="col-span-2 flex justify-center gap-2">
      <button onClick={() => onEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
      <button onClick={() => onDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
    </div>
  </div>
));

const InventoryItem = React.memo(({ item, users, onEdit, onDelete, t }: { item: any, users: User[], onEdit: (i: any) => void, onDelete: (id: string) => void, t: (key: string) => string }) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-5 flex items-center gap-4 pl-4">
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package size={20} />}
      </div>
      <div className="min-w-0">
        <div className="font-black dark:text-white text-sm truncate">{item.name}</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase">{item.category || t('no_category')}</div>
      </div>
    </div>
    <div className="col-span-4 text-center">
      <div className="text-sm font-black text-primary">{(item.defaultPrice || 0).toLocaleString()} IQD</div>
      <div className="text-[9px] text-slate-400 font-bold uppercase">{t('user')}: {users.find(u => u.id === item.userId)?.name || t('unknown')}</div>
    </div>
    <div className="col-span-3 flex justify-center gap-2">
      <button onClick={() => onEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
      <button onClick={() => onDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
    </div>
  </div>
));

const CategoryItem = React.memo(({ item, onEdit, onDelete }: { item: any, onEdit: (i: any) => void, onDelete: (id: string) => void }) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-9 flex items-center gap-4 pl-4">
      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color || '#ccc' }}></div>
      <div className="font-black dark:text-white text-sm">{item.name}</div>
    </div>
    <div className="col-span-3 flex justify-center gap-2">
      <button onClick={() => onEdit(item)} className="p-3 bg-white/10 hover:bg-primary hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Edit3 size={16}/></button>
      <button onClick={() => onDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm"><Trash2 size={16}/></button>
    </div>
  </div>
));

const SupportItem = React.memo(({ item, onReply, t }: { item: SupportTicket, onReply: (t: SupportTicket) => void, t: (key: string) => string }) => (
  <div className="grid grid-cols-12 p-4 items-center bg-white/5 dark:bg-white/[0.02] hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all mb-2 mx-2 rounded-[2rem] border border-white/10 dark:border-white/5 group relative overflow-hidden">
    <div className="col-span-5 pl-4">
      <div className="flex items-center gap-2">
        <div className="font-black dark:text-white text-sm truncate">{item.userName}</div>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{item.status}</span>
      </div>
      <div className="text-[10px] text-slate-500 line-clamp-1 mt-1">{item.message}</div>
    </div>
    <div className="col-span-4 text-center">
      <div className="text-[9px] text-slate-400 font-bold">{new Date(item.createdAt).toLocaleString()}</div>
      <div className="text-[9px] text-primary font-black uppercase">{item.replies?.length || 0} {t('replies')}</div>
    </div>
    <div className="col-span-3 flex justify-center gap-2">
      <button onClick={() => onReply(item)} className="p-3 bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl text-slate-500 transition-all shadow-sm">
        <MessageSquare size={16}/>
      </button>
    </div>
  </div>
));

interface AdminDashboardProps {
  users: User[];
  onlineUsers?: string[];
  headlines: Headline[];
  transactions: any[];
  products: any[];
  categories: any[];
  supportTickets: SupportTicket[];
  onUpdateUsers: (newUsers: User[] | ((prev: User[]) => User[])) => void;
  onUpdateHeadlines: (newHeadlines: Headline[] | ((prev: Headline[]) => Headline[])) => void;
  onUpdateTransactions: (newTransactions: any[] | ((prev: any[]) => any[])) => void;
  onUpdateProducts: (newProducts: any[] | ((prev: any[]) => any[])) => void;
  onUpdateCategories: (newCategories: any[] | ((prev: any[]) => any[])) => void;
  onUpdateSupportTickets: (newTickets: SupportTicket[] | ((prev: SupportTicket[]) => SupportTicket[])) => void;
  onDeleteTransaction: (id: string) => void;
  t: (key: string) => string;
  currentUser: User;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  onSendNotification: (notification: { title: string, message: string, type: 'info'|'success'|'warning'|'error' }, isGlobal?: boolean) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = React.memo(({ 
  users, onlineUsers = [], headlines, transactions, products, categories, supportTickets,
  onUpdateUsers, onUpdateHeadlines, 
  onUpdateTransactions, onUpdateProducts, onUpdateCategories, onUpdateSupportTickets,
  onDeleteTransaction, t, currentUser,
  config, onUpdateConfig, onSendNotification
}) => {
  // Available tabs based on role
  const availableTabs = useMemo(() => [
    { id: 'users', label: t('users'), icon: Users, roles: ['developer', 'admin', 'staff', 'moderator'] },
    { id: 'news', label: t('news'), icon: Newspaper, roles: ['developer', 'admin', 'moderator', 'editor'] },
    { id: 'inventory', label: t('inventory'), icon: Package, roles: ['developer', 'admin', 'editor'] },
    { id: 'categories', label: t('categories'), icon: Layers, roles: ['developer', 'admin', 'editor'] },
    { id: 'transactions', label: t('transactions'), icon: Database, roles: ['developer', 'admin', 'editor'] },
    { id: 'support', label: t('support_tickets'), icon: MessageSquare, roles: ['developer', 'admin', 'moderator', 'editor'] },
    { id: 'notifications', label: t('notifications'), icon: Bell, roles: ['developer', 'admin', 'moderator', 'editor'] },
  ].filter(t => hasRole(currentUser, t.roles)), [currentUser, t]);

  const [tab, setTab] = useState<'users' | 'news' | 'transactions' | 'inventory' | 'categories' | 'support' | 'notifications'>('users');

  // Ensure valid tab selection
  useEffect(() => {
    if (availableTabs.length > 0) {
      const isCurrentTabAvailable = availableTabs.some(t => t.id === tab);
      if (!isCurrentTabAvailable) {
        setTab(availableTabs[0].id as any);
      }
    }
  }, [currentUser.role, availableTabs, tab]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info'|'success'|'warning'|'error'>('info');

  const handleSendNotification = useCallback(() => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      onSendNotification({ title: t('error'), message: t('please_enter_title_message'), type: 'error' }, false);
      return;
    }
    
    // Send the actual notification (will be broadcast to everyone)
    onSendNotification({ 
      title: notifTitle.trim(), 
      message: notifMessage.trim(), 
      type: notifType 
    }, true);
    
    setNotifTitle('');
    setNotifMessage('');
    
    // Show success message locally to admin
    onSendNotification({ 
      title: t('success'), 
      message: t('notification_sent'), 
      type: 'success' 
    }, false);
  }, [notifTitle, notifMessage, notifType, onSendNotification, t]);

  const startEdit = useCallback((item: any) => {
    const cleanedItem = { ...item };
    // Clean up 'null' strings and null values from DB
    Object.keys(cleanedItem).forEach(key => {
      if (cleanedItem[key] === 'null' || cleanedItem[key] === null) {
        cleanedItem[key] = '';
      }
    });
    if (!cleanedItem.role) cleanedItem.role = 'user';
    if (!cleanedItem.status) cleanedItem.status = 'approved';
    
    setEditForm(cleanedItem);
    setEditingId(item.id);
    setIsAdding(false);
  }, []);

  const startAdd = useCallback(() => {
    setIsAdding(true);
    setEditingId('new');
    if (tab === 'users') {
      setEditForm({ name: '', businessName: '', email: '', password: '', phone: '', country: '', city: '', address: '', role: 'user', status: 'approved' });
    } else if (tab === 'news') {
      setEditForm({ text: '', active: true });
    } else if (tab === 'inventory') {
      setEditForm({ name: '', defaultPrice: 0, userId: currentUser.id, category: '' });
    } else if (tab === 'categories') {
      setEditForm({ name: '', color: '#10b981' });
    } else if (tab === 'transactions') {
      setEditForm({ itemName: '', type: 'sell', amount: 1, price: 0, total: 0, userId: currentUser.id, date: new Date().toISOString() });
    } else if (tab === 'support') {
      setEditForm({ userName: '', message: '', status: 'pending', createdAt: new Date().toISOString() });
    }
  }, [tab, currentUser.id, config.okxSymbols]);

  const saveEdit = useCallback(() => {
    if (!editForm) return;

    const now = new Date().toISOString();
    
    if (tab === 'users') {
      const userItem = { ...editForm };
      onUpdateUsers(prev => isAdding ? [{ ...userItem, id: `u_${Date.now()}`, createdAt: now }, ...prev] : prev.map(u => u.id === editingId ? userItem : u));
      
      // Persist to server
      if (!isAdding) {
        fetch(`/api/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userItem)
        }).catch(console.error);
      }
    } else if (tab === 'news') {
      onUpdateHeadlines(prev => isAdding ? [{ ...editForm, id: `h_${Date.now()}`, date: now }, ...prev] : prev.map(h => h.id === editingId ? { ...editForm, date: now } : h));
    } else if (tab === 'inventory') {
      const prodItem = { ...editForm, defaultPrice: parseFloat(String(editForm.defaultPrice)) || 0 };
      onUpdateProducts(prev => isAdding ? [{ ...prodItem, id: `p_${Date.now()}` }, ...prev] : prev.map(p => p.id === editingId ? prodItem : p));
    } else if (tab === 'categories') {
      onUpdateCategories(prev => isAdding ? [{ ...editForm, id: `cat_${Date.now()}` }, ...prev] : prev.map(c => c.id === editingId ? editForm : c));
    } else if (tab === 'transactions') {
      const txItem = { ...editForm, total: (parseFloat(editForm.amount) || 0) * (parseFloat(editForm.price) || 0) };
      onUpdateTransactions(prev => isAdding ? [{ ...txItem, id: `tx_${Date.now()}` }, ...prev] : prev.map(t => t.id === editingId ? txItem : t));
    } else if (tab === 'support') {
      onUpdateSupportTickets(prev => isAdding ? [{ ...editForm, id: `st_${Date.now()}` }, ...prev] : prev.map(st => st.id === editingId ? editForm : st));
    }
    setEditingId(null);
    setEditForm(null);
  }, [editForm, tab, isAdding, editingId, onUpdateUsers, onUpdateHeadlines, onUpdateProducts, onUpdateCategories, onUpdateTransactions, onUpdateSupportTickets]);

  const deleteItem = useCallback((id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
    
    if (tab === 'users') onUpdateUsers(prev => prev.filter(x => x.id !== id));
    else if (tab === 'news') onUpdateHeadlines(prev => prev.filter(x => x.id !== id));
    else if (tab === 'inventory') onUpdateProducts(prev => prev.filter(x => x.id !== id));
    else if (tab === 'categories') onUpdateCategories(prev => prev.filter(x => x.id !== id));
    else if (tab === 'transactions') onUpdateTransactions(prev => prev.filter(x => x.id !== id));
    else if (tab === 'support') onUpdateSupportTickets(prev => prev.filter(x => x.id !== id));
  }, [editingId, tab, onUpdateUsers, onUpdateHeadlines, onUpdateProducts, onUpdateCategories, onUpdateTransactions, onUpdateSupportTickets]);

  const clearAllData = useCallback(() => {
    // Using a simple state-based confirmation would be better, but for now we'll just skip the alert
    // and provide feedback via notification.
    if (tab === 'users') onUpdateUsers(prev => prev.filter(u => hasRole(u, 'developer'))); // Keep admin
    else if (tab === 'news') onUpdateHeadlines([]);
    else if (tab === 'inventory') onUpdateProducts([]);
    else if (tab === 'categories') onUpdateCategories([]);
    else if (tab === 'transactions') onUpdateTransactions([]);
    else if (tab === 'support') onUpdateSupportTickets([]);
    
    onSendNotification({ title: t('success'), message: t('data_cleared_success'), type: 'success' }, false);
  }, [tab, onUpdateUsers, onUpdateHeadlines, onUpdateProducts, onUpdateCategories, onUpdateTransactions, onUpdateSupportTickets, onSendNotification, t]);

  const toggleUserStatus = useCallback(async (user: User) => {
    // Staff can only toggle 'user' role
    if (hasRole(currentUser, 'staff') && !hasRole(currentUser, ['admin', 'developer']) && !hasRole(user, 'user')) return;
    // Admins cannot toggle developers
    if (hasRole(user, 'developer')) return;

    let newStatus: 'approved' | 'blocked' | 'pending';
    
    if (user.status === 'pending') {
      newStatus = 'approved';
    } else if (user.status === 'approved') {
      newStatus = 'blocked';
    } else {
      newStatus = 'approved';
    }

    // Update status in DB
    try {
      await fetch('/api/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: user.role, status: newStatus })
      });
      onUpdateUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      onSendNotification({ title: t('success'), message: t('user_status_updated'), type: 'success' }, false);
    } catch (err) {
      onSendNotification({ title: t('error'), message: t('error_updating_user'), type: 'error' }, false);
    }
  }, [currentUser, onUpdateUsers, onSendNotification, t]);

  const handleSupportReply = useCallback((item: SupportTicket) => {
    // In a real app, we'd show a modal here. For now, we'll just log it.
    console.log('Support reply clicked for:', item.id);
    onSendNotification({ title: t('info'), message: t('use_edit_form_reply'), type: 'info' }, false);
  }, [onSendNotification, t]);

  const handleDeleteTransactionCallback = useCallback((id: string) => {
    onDeleteTransaction(id);
    onSendNotification({ title: t('success'), message: t('transaction_deleted'), type: 'success' }, false);
  }, [onDeleteTransaction, onSendNotification, t]);

  const handleTabChange = useCallback((id: string) => {
    setTab(id as any);
  }, []);

  const handleToggleLocalMarket = useCallback(() => {
    onUpdateConfig({...config, isLocalMarketLocked: !config.isLocalMarketLocked});
  }, [config, onUpdateConfig]);

  const handleToggleNotifications = useCallback(() => {
    onUpdateConfig({...config, notificationsEnabled: !config.notificationsEnabled});
  }, [config, onUpdateConfig]);

  // Removed renderRateItem


  const renderNewsItem = useCallback((_index: number, item: Headline) => (
    <NewsItem key={item.id} item={item} onEdit={startEdit} onDelete={deleteItem} />
  ), [startEdit, deleteItem]);

  const renderUserItem = useCallback((_index: number, item: User) => (
    <UserItem 
      key={item.id} 
      item={item} 
      onlineUsers={onlineUsers} 
      currentUser={currentUser} 
      onEdit={startEdit} 
      onDelete={deleteItem} 
      onToggleStatus={toggleUserStatus} 
      t={t}
    />
  ), [onlineUsers, currentUser, startEdit, deleteItem, toggleUserStatus, t]);

  const renderTransactionItem = useCallback((_index: number, item: any) => (
    <TransactionItem 
      key={item.id} 
      item={item} 
      users={users} 
      onEdit={startEdit} 
      onDelete={handleDeleteTransactionCallback} 
      t={t}
    />
  ), [users, startEdit, handleDeleteTransactionCallback, t]);

  const renderInventoryItem = useCallback((_index: number, item: any) => (
    <InventoryItem 
      key={item.id} 
      item={item} 
      users={users} 
      onEdit={startEdit} 
      onDelete={deleteItem} 
      t={t}
    />
  ), [users, startEdit, deleteItem, t]);

  const renderCategoryItem = useCallback((_index: number, item: any) => (
    <CategoryItem key={item.id} item={item} onEdit={startEdit} onDelete={deleteItem} />
  ), [startEdit, deleteItem]);

  const renderSupportItem = useCallback((_index: number, item: SupportTicket) => (
    <SupportItem key={item.id} item={item} onReply={handleSupportReply} t={t} />
  ), [handleSupportReply, t]);

  const handleClearAllData = useCallback(() => {
    clearAllData();
  }, [clearAllData]);

  const handleStartAdd = useCallback(() => {
    startAdd();
  }, [startAdd]);

  const handleNotifTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifTitle(e.target.value);
  }, []);

  const handleNotifMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotifMessage(e.target.value);
  }, []);

  const handleNotifTypeChange = useCallback((type: 'info' | 'success' | 'warning' | 'error') => {
    setNotifType(type);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 animate-in fade-in">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 mx-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
            <Database size={24} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('server_status')}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              {t('online_synced')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white uppercase italic tracking-tighter crafted-title">
            <Shield size={24} className="text-primary" /> {t('admin_title')}
          </h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mx-2">
        <div className="flex bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar border border-white/20 dark:border-white/5 shadow-xl w-full md:w-auto">
          {availableTabs.map(tItem => (
            <button 
              key={tItem.id} 
              onClick={() => handleTabChange(tItem.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${tab === tItem.id ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/10'}`}
            >
              <tItem.icon size={14} /> {tItem.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl w-full md:w-auto">
          <button 
            onClick={handleToggleLocalMarket}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${config.isLocalMarketLocked ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg'}`}
          >
            <ShieldAlert size={14} />
            {config.isLocalMarketLocked ? t('unlock_all_local') : t('lock_all_local')}
          </button>
          <button 
            onClick={handleToggleNotifications}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${config.notificationsEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/10'}`}
          >
            <Smartphone size={14} />
            {config.notificationsEnabled ? t('on') : t('off')}
          </button>
          <button onClick={handleClearAllData} className="text-slate-500 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm">{t('clear_all')}</button>
          <button onClick={handleStartAdd} className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg">{t('new_item')}</button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2 relative z-10">
        {tab === 'notifications' ? (
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} />
                </div>
                <h3 className="text-2xl font-black dark:text-white">{t('send_global_notification')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t('global_notification_desc')}</p>
              </div>

              <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-white/20 dark:border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('title')}</label>
                  <input 
                    type="text" 
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder={t('example_system_update')}
                    className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-sm dark:text-white focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('message')}</label>
                  <textarea 
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder={t('type_message_here')}
                    className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-sm dark:text-white focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('notification_type')}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'info', label: t('info'), color: 'blue' },
                      { id: 'success', label: t('success'), color: 'emerald' },
                      { id: 'warning', label: t('warning'), color: 'amber' },
                      { id: 'error', label: t('error'), color: 'rose' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setNotifType(type.id as any)}
                        className={`p-3 rounded-xl font-black text-[10px] uppercase transition-all border ${
                          notifType === type.id 
                            ? `bg-${type.color}-500 text-white border-${type.color}-500 shadow-lg shadow-${type.color}-500/20` 
                            : `bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-${type.color}-500/50`
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={!notifTitle || !notifMessage}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20"
                >
                  <Send size={20} />
                  {t('send_notification')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 bg-white/20 dark:bg-white/5 p-5 border-b border-white/10 dark:border-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest crafted-label">
              <div className="col-span-5">{tab === 'support' ? t('user_message') : t('item')}</div>
              <div className="col-span-4 text-center">{tab === 'news' ? t('status') : (tab === 'users' ? t('role_status') : (tab === 'support' ? t('status') : t('buy_sell')))}</div>
              <div className="col-span-3 text-center">{t('actions')}</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 h-[600px]">
              {/* Rates tab removed */}
              {tab === 'news' && Array.isArray(headlines) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={headlines}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderNewsItem}
                  increaseViewportBy={200}
                />
              )}
              {tab === 'users' && Array.isArray(users) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={users}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderUserItem}
                  increaseViewportBy={300}
                />
              )}
              {tab === 'transactions' && Array.isArray(transactions) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={transactions}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderTransactionItem}
                  increaseViewportBy={200}
                />
              )}
              {tab === 'inventory' && Array.isArray(products) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={products}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderInventoryItem}
                  increaseViewportBy={200}
                />
              )}
              {tab === 'categories' && Array.isArray(categories) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={categories}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderCategoryItem}
                  increaseViewportBy={200}
                />
              )}
              {tab === 'support' && Array.isArray(supportTickets || []) && (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={supportTickets || []}
                  computeItemKey={(index, item) => item.id}
                  itemContent={renderSupportItem}
                  increaseViewportBy={200}
                />
              )}
              {/* Crypto tab removed */}
            </div>

        </>
        )}
      </div>

      {editingId && editForm && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              if (e.target instanceof HTMLTextAreaElement) return;
              e.preventDefault();
              saveEdit();
            }
          }}
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black dark:text-white uppercase italic tracking-tighter">
                  {isAdding ? t('new_item') : t('edit')}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{editingId}</p>
              </div>
              <button onClick={() => { setEditingId(null); setEditForm(null); }} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {tab === 'users' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('business_name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.businessName || ''} onChange={e => setEditForm({...editForm, businessName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('email')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('avatar_url')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.avatar || ''} onChange={e => setEditForm({...editForm, avatar: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('password')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.password || ''} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('phone')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('country')}</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.country || ''} onChange={e => setEditForm({...editForm, country: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('city')}</label>
                      <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('address')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('activity_points')}</label>
                    <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.activityPoints || 0} onChange={e => setEditForm({...editForm, activityPoints: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('wallet_balance')}</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" 
                        value={editForm.wallet?.balance || 0} 
                        onChange={e => setEditForm({
                          ...editForm, 
                          wallet: { 
                            ...(editForm.wallet || { address: '', currency: 'IQD' }), 
                            balance: parseFloat(e.target.value) || 0 
                          }
                        })} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('wallet_currency')}</label>
                      <select 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" 
                        value={editForm.wallet?.currency || 'IQD'} 
                        onChange={e => setEditForm({
                          ...editForm, 
                          wallet: { 
                            ...(editForm.wallet || { address: '', balance: 0 }), 
                            currency: e.target.value 
                          }
                        })}
                      >
                        <option value="IQD">IQD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="TRY">TRY</option>
                        <option value="IRR">IRR</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('wallet_address')}</label>
                    <input 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" 
                      value={editForm.wallet?.address || ''} 
                      onChange={e => setEditForm({
                        ...editForm, 
                        wallet: { 
                          ...(editForm.wallet || { balance: 0, currency: 'IQD' }), 
                          address: e.target.value 
                        }
                      })} 
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase">{t('roles')}</label>
                      <div className="flex flex-wrap gap-2">
                        {(config.roles || [{name: 'user'}, {name: 'staff'}, {name: 'VIP'}, {name: 'VIP+'}, {name: 'admin'}, {name: 'moderator'}, {name: 'kargeri'}, {name: 'editor'}, {name: 'developer'}]).map(roleObj => {
                          const r = roleObj.name;
                          // Allow all roles if current user is admin, developer, or editor
                          if (!hasRole(currentUser, ['admin', 'developer', 'editor'])) return null;
                          
                          const isSelected = (editForm.role || '').split(',').map((x: string) => x.trim()).includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                // Allow role toggle if current user is admin, developer, or editor
                                if (!hasRole(currentUser, ['admin', 'developer', 'editor'])) return;
                                let roles = (editForm.role || '').split(',').map((x: string) => x.trim()).filter(Boolean);
                                if (isSelected) roles = roles.filter((x: string) => x !== r);
                                else roles.push(r);
                                if (roles.length === 0) roles = ['user'];
                                setEditForm({...editForm, role: roles.join(',')});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                              {roleObj.icon && React.createElement((LucideIcons as any)[roleObj.icon] || LucideIcons.Shield, { size: 12 })}
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">{t('status')}</label>
                      <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        <option value="approved">{t('approved')}</option>
                        <option value="pending">{t('pending')}</option>
                        <option value="blocked">{t('blocked')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('expiration')}</label>
                    <div className="flex gap-2">
                      <input 
                        type="datetime-local" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary ltr" 
                        value={(() => {
                          if (!editForm.expiresAt) return '';
                          try {
                            const d = new Date(editForm.expiresAt);
                            if (isNaN(d.getTime())) return '';
                            return d.toISOString().slice(0, 16);
                          } catch(e) { return ''; }
                        })()} 
                        onChange={e => {
                          try {
                            setEditForm({...editForm, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined});
                          } catch(err) {
                            setEditForm({...editForm, expiresAt: undefined});
                          }
                        }} 
                      />
                      <button 
                        onClick={() => setEditForm({...editForm, expiresAt: undefined})}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-500"
                        title="Clear Expiration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                      {[
                        { label: '1h', val: 1 * 60 * 60 * 1000 },
                        { label: '24h', val: 24 * 60 * 60 * 1000 },
                        { label: '7d', val: 7 * 24 * 60 * 60 * 1000 },
                        { label: '30d', val: 30 * 24 * 60 * 60 * 1000 },
                      ].map(opt => (
                        <button 
                          key={opt.label}
                          onClick={() => setEditForm({...editForm, expiresAt: new Date(Date.now() + opt.val).toISOString()})}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                        >
                          +{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Rates and Crypto forms removed */}

              {tab === 'news' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('news_text')}</label>
                  <textarea rows={4} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.text || ''} onChange={e => setEditForm({...editForm, text: e.target.value})} />
                </div>
              )}

              {tab === 'inventory' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('product_name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('price')}</label>
                    <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.defaultPrice || ''} onChange={e => setEditForm({...editForm, defaultPrice: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</label>
                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                      <option value="">{t('no_category')}</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {tab === 'categories' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('category_name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('color')}</label>
                    <input type="color" className="w-full h-12 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none" value={editForm.color || '#10b981'} onChange={e => setEditForm({...editForm, color: e.target.value})} />
                  </div>
                </>
              )}

              {tab === 'transactions' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('item_name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.itemName || ''} onChange={e => setEditForm({...editForm, itemName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('price')}</label>
                      <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.price || ''} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('type')}</label>
                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.type || 'sell'} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                      <option value="buy">{t('buy')}</option>
                      <option value="sell">{t('sell')}</option>
                      <option value="expense">{t('expense')}</option>
                      <option value="rent">{t('rent')}</option>
                    </select>
                  </div>
                </>
              )}

              {tab === 'support' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('user_name')}</label>
                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.userName || ''} onChange={e => setEditForm({...editForm, userName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('message')}</label>
                    <textarea rows={4} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none text-xs dark:text-white focus:border-primary" value={editForm.message || ''} onChange={e => setEditForm({...editForm, message: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('status')}</label>
                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] dark:text-white appearance-none" value={editForm.status || 'pending'} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="pending">{t('pending')}</option>
                      <option value="resolved">{t('resolved')}</option>
                      <option value="closed">{t('closed')}</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
              <button onClick={saveEdit} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                <Check size={18}/> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AdminDashboard;
