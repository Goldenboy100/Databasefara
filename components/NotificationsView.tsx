import React from 'react';
import { motion } from 'framer-motion';
import { AppNotification, User } from '../types.ts';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { hasRole } from '../utils.ts';

interface NotificationsViewProps {
  notifications: AppNotification[];
  currentUser: User | null;
  onUpdateNotifications: (notifs: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => void;
}

export default function NotificationsView({ notifications, currentUser, onUpdateNotifications }: NotificationsViewProps) {
  const markAsRead = (id: string) => {
    if (!currentUser) return;
    onUpdateNotifications(prev => prev.map(n => {
      if (n.id === id && !n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  const markAllAsRead = () => {
    if (!currentUser) return;
    onUpdateNotifications(prev => prev.map(n => {
      if (!n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  const deleteNotification = (id: string) => {
    if (!hasRole(currentUser, ['admin', 'developer'])) return;
    onUpdateNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      case 'error': return <XCircle className="text-rose-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const unreadCount = notifications.filter(n => !currentUser || !n.readBy.includes(currentUser.id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notifications</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">You have {unreadCount} unread messages</p>
          </div>
        </div>
        {unreadCount > 0 && currentUser && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No notifications yet</h3>
          </div>
        ) : (
          notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => {
            const isRead = currentUser && notif.readBy.includes(currentUser.id);
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${isRead ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 shadow-sm'}`}
                onClick={() => !isRead && markAsRead(notif.id)}
              >
                <div className="mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{notif.title}</h3>
                    <span className="text-xs font-bold text-slate-400">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                  <p className={`text-sm ${isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{notif.message}</p>
                </div>
                {hasRole(currentUser, ['admin', 'developer']) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
