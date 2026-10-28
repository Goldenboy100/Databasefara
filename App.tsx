
import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { 
  TrendingUp, Settings, Bitcoin, Coins, Calculator, Cpu, Shield, TrendingDown, X, Activity, Edit3, Star, Play, Pause, Trophy, Image as ImageIcon, Bell, 
  PieChart, LayoutGrid, List, Globe, Clock, Zap, Wallet, ArrowRightLeft, DollarSign
} from 'lucide-react';
import { ViewMode, User, ThemeMode, LanguageCode, AppConfig, Headline, Transaction, Product, Category, SupportTicket, LogEntry, Ad, AppNotification } from './types.ts';
import { hasRole } from './utils.ts';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { TRANSLATIONS_INITIAL, DEFAULT_CONFIG } from './constants.ts';
import AdsBanner from './components/AdsBanner.tsx';
import Login from './components/Login.tsx';
import { usePushNotifications } from './components/usePushNotifications.ts';

// Lazy loaded components
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard.tsx'));
const SettingsView = React.lazy(() => import('./components/SettingsView.tsx'));
const DeveloperView = React.lazy(() => import('./components/DeveloperView.tsx'));
// Removed FavoritesView import
const KargeriDashboard = React.lazy(() => import('./components/KargeriDashboard.tsx'));
const EditorDashboard = React.lazy(() => import('./components/EditorDashboard.tsx'));
const AccountsView = React.lazy(() => import('./components/AccountsView.tsx'));
const ActivityRanking = React.lazy(() => import('./components/ActivityRanking.tsx'));
const AdsManager = React.lazy(() => import('./components/AdsManager.tsx'));
const AboutView = React.lazy(() => import('./components/AboutView.tsx'));
const NotificationsView = React.lazy(() => import('./components/NotificationsView.tsx'));
const WalletView = React.lazy(() => import('./components/WalletView.tsx'));
import GoldenAccounting from './components/accounting/GoldenAccounting.tsx';
// const GoldenAccounting = React.lazy(() => import('./components/accounting/GoldenAccounting.tsx'));

// Safe JSON parsing utility
const safeParse = (text: string | null | undefined, fallback: any) => {
  if (text === undefined || text === null) return fallback;
  if (typeof text !== 'string') return fallback;
  if (text === 'undefined' || text === 'null' || text.trim() === 'undefined' || text.trim() === '') return fallback;
  try {
    const data = JSON.parse(text);
    return data !== null ? data : fallback;
  } catch (e) {
    console.warn("JSON parse error:", e);
    return fallback;
  }
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  
  try {
    const response = await fetch(url, { ...options, headers, cache: 'no-store' });
    if (!response.ok) {
      const text = await response.text();
      console.warn(`API Error: ${response.status} ${response.statusText} for ${url}. Response: ${text.substring(0, 100)}`);
    }
    return response;
  } catch (error) {
    console.warn(`Network notice fetching ${url}:`, error);
    throw error;
  }
};

const FALLBACK_GOLDEN_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F59E0B'/%3E%3Cstop offset='50%25' stop-color='%23D97706'/%3E%3Cstop offset='100%25' stop-color='%23B45309'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' rx='28' fill='url(%23g)'/%3E%3Ccircle cx='60' cy='60' r='38' fill='none' stroke='%23FFFFFF' stroke-width='4' stroke-opacity='0.4'/%3E%3Ccircle cx='60' cy='60' r='30' fill='%23000000' fill-opacity='0.2'/%3E%3Cpath d='M60 32 L72 54 L64 54 L64 80 L56 80 L56 54 L48 54 Z' fill='%23FFFFFF'/%3E%3Ctext x='60' y='68' font-family='system-ui,sans-serif' font-size='18' font-weight='900' fill='%23FFFFFF' text-anchor='middle'%3EG%3C/text%3E%3C/svg%3E";

// Safe localStorage access
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return null;
  }
};

const App: React.FC = () => {
  const STORAGE_KEY = 'golden_v21_data';
  const lastEditTime = useRef(0);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setShowInstallBanner(false);
    } else if (isIOSDevice) {
      // For iOS, we can show the banner after a short delay if not standalone
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, we just show instructions
      setView('settings');
      setShowInstallBanner(false);
      return;
    }
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const [appState, setAppState] = useState<'welcome' | 'splash' | 'main'>(() => {
    try {
      if (!localStorage.getItem('golden_v21_has_seen_welcome')) {
        return 'welcome';
      }
      return 'splash';
    } catch (e) {
      return 'splash';
    }
  });

  // Safety timeout to ensure app always opens if stuck on splash
  useEffect(() => {
    if (appState === 'splash') {
      const safetyTimer = setTimeout(() => {
        console.warn("Force transitioning to main app due to timeout");
        setAppState('main');
      }, 3500); // Reduced from 5000 to 3500 for better UX
      return () => clearTimeout(safetyTimer);
    }
  }, [appState]);

  useEffect(() => {
    if (appState === 'splash') {
      // Mark welcome as seen if not already
      try {
        if (!localStorage.getItem('golden_v21_has_seen_welcome')) {
          localStorage.setItem('golden_v21_has_seen_welcome', 'true');
        }
      } catch (e) {
        console.warn("Failed to set welcome flag:", e);
      }

      const timer = setTimeout(() => {
        setAppState('main');
      }, 2000); // Reduced from 2500 to 2000
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const [headlines, setHeadlines] = useState<Headline[]>(() => {
    const saved = safeGetItem(`${STORAGE_KEY}_news`); 
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = safeGetItem(`${STORAGE_KEY}_config`); 
    const data = safeParse(saved, DEFAULT_CONFIG);
    const merged = (data && typeof data === 'object') ? { ...DEFAULT_CONFIG, ...data } : DEFAULT_CONFIG;
    
    // If roles are missing or empty, use the ones from DEFAULT_CONFIG
    if (!merged.roles || merged.roles.length === 0) {
      merged.roles = DEFAULT_CONFIG.roles;
    } else if (DEFAULT_CONFIG.roles) {
      // Merge missing default roles into existing roles
      const existingRoleNames = new Set(merged.roles.map((r: any) => r.name));
      DEFAULT_CONFIG.roles.forEach(defaultRole => {
        if (!existingRoleNames.has(defaultRole.name)) {
          merged.roles!.push(defaultRole);
        }
      });
    }
    
    return merged;
  });

  useEffect(() => {
    if (config?.favicon) {
      // Update favicon
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      (link as HTMLLinkElement).type = 'image/x-icon';
      (link as HTMLLinkElement).rel = 'shortcut icon';
      (link as HTMLLinkElement).href = config.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);

      // Update apple-touch-icon
      const appleLink = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
      (appleLink as HTMLLinkElement).rel = 'apple-touch-icon';
      (appleLink as HTMLLinkElement).href = config.favicon;
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
  }, [config?.favicon]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeGetItem(`${STORAGE_KEY}_user`); 
    const data = safeParse(saved, null);
    return (data && typeof data === 'object') ? data : null;
  });

  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [language, setLanguage] = useState<LanguageCode>(() => (localStorage.getItem(`${STORAGE_KEY}_lang`) as LanguageCode) || 'ku');
  const [view, setView] = useState<ViewMode>('accounting');

  usePushNotifications(currentUser?.id);

  // Removed filteredRates memo

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = safeGetItem(`${STORAGE_KEY}_favorites`); 
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });

  const t = useCallback((key: string): string => {
    const langTrans = config.translations?.[language] || TRANSLATIONS_INITIAL[language] || {};
    const fallbackTrans = TRANSLATIONS_INITIAL[language] || TRANSLATIONS_INITIAL['ku'] || {};
    
    return (langTrans as any)[key] || (fallbackTrans as any)[key] || key;
  }, [language, config]);

  // --- NOTIFICATION SYSTEM ---
  const [notifications, setNotifications] = useState<{ id: string, text: string, type: 'up' | 'down' | 'error' | 'info' }[]>([]);
  const [globalNotification, setGlobalNotification] = useState<{id: string, title: string, message: string, type: 'info'|'success'|'warning'|'error'} | null>(null);

  const addNotification = useCallback((text: string, type: 'up' | 'down' | 'error' | 'info', itemId?: string) => {
    if (!config.notificationsEnabled) return;

    // For item-specific notifications (like price changes)
    if (itemId) {
      // If there are no favorites at all, don't send any price-change notifications.
      if (favorites.length === 0) return;
      // If there are favorites, only send notifications for those items.
      if (!favorites.includes(itemId)) return;
    }

    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [config.notificationsEnabled, favorites]);

  // Removed rates price change notification logic

  const handleLogout = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    setCurrentUser(null);
  }, [STORAGE_KEY]);

  // Sync currentUser to localStorage and check for blocking
  useEffect(() => {
    if (currentUser) {
      if (currentUser.status === 'blocked') {
        alert('هەژمارەکەت ڕاگیراوە!');
        handleLogout();
        return;
      }
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_user`);
    }
  }, [currentUser, handleLogout, STORAGE_KEY]);

  // Monitor role changes and reset view if permission is lost
  useEffect(() => {
    if (!currentUser) return;

    const checkViewPermission = () => {
      if (view === 'admin' && !hasRole(currentUser, ['developer', 'admin', 'staff', 'moderator', 'kargeri', 'editor'])) return true;
      if (view === 'developer' && !hasRole(currentUser, 'developer')) return true;
      if (view === 'kargeri' && !hasRole(currentUser, ['developer', 'kargeri'])) return true;
      if (view === 'editor' && !hasRole(currentUser, ['developer', 'editor'])) return true;
      if (view === 'ads' && !hasRole(currentUser, 'developer')) return true;
      if (view === 'accounts' && !hasRole(currentUser, ['developer', 'admin', 'staff', 'VIP', 'VIP+'])) return true;
      return false;
    };

    if (checkViewPermission()) {
      setView('accounting');
      addNotification('دەسەڵاتەکانت گۆڕدراون، گەڕایتەوە بۆ پەڕەی سەرەکی', 'info');
    }
  }, [currentUser?.role, view]);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      // Update the user in the users list and sync to server
      // handleUpdateUsers will also update currentUser state
      handleUpdateUsers(allUsers => {
        const exists = allUsers.some(u => u.id === currentUser.id);
        if (!exists) return allUsers;
        return allUsers.map(u => u.id === currentUser.id ? { ...u, activityPoints: (u.activityPoints || 0) + 1 } : u);
      });
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [currentUser?.id]); // Only re-run if the user ID changes

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = safeGetItem(`${STORAGE_KEY}_transactions`); 
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`); 
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`); 
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const addLog = useCallback((action: LogEntry['action'], target: LogEntry['target'], details: string) => {
    if (!currentUser) return;
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      target,
      details
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Also sync logs to server if needed
    try {
      apiFetch('/api/logs', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newLog) 
      }).catch(err => console.warn('Failed to persist log:', err));
    } catch (e) {
      console.warn('Could not stringify log:', e);
    }
  }, [currentUser]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Real-time Sync with Socket.io
  const socketRef = useRef<any>(null);
  const pendingUpdates = useRef<{ [key: string]: any }>({});
  const updateTimer = useRef<any>(null);

  const processPendingUpdates = useCallback(() => {
    const updates = pendingUpdates.current;
    if (Object.keys(updates).length === 0) return;

    const safeCompare = (prev: any, next: any) => {
      if (!prev || !next) return prev !== next;
      try {
        return JSON.stringify(prev) !== JSON.stringify(next);
      } catch (e) {
        console.warn('Circular structure detected in state comparison, forcing update');
        return true;
      }
    };

    // Removed rates sync from updates
    if (updates.headlines) setHeadlines(prev => safeCompare(prev, updates.headlines) ? updates.headlines : prev);
    if (updates.config) setConfig(prev => safeCompare(prev, updates.config) ? updates.config : prev);
    if (updates.users) setUsers(prev => safeCompare(prev, updates.users) ? updates.users : prev);
    if (updates.transactions) setTransactions(prev => safeCompare(prev, updates.transactions) ? updates.transactions : prev);
    if (updates.products) setProducts(prev => safeCompare(prev, updates.products) ? updates.products : prev);
    if (updates.categories) setCategories(prev => safeCompare(prev, updates.categories) ? updates.categories : prev);
    if (updates.support) setSupportTickets(prev => safeCompare(prev, (updates.support || [])) ? (updates.support || []) : prev);
    if (updates.ads) setAds(prev => safeCompare(prev, (updates.ads || [])) ? (updates.ads || []) : prev);
    if (updates.notifications) setAppNotifications(prev => safeCompare(prev, (updates.notifications || [])) ? (updates.notifications || []) : prev);

    pendingUpdates.current = {};
  }, []);

  useEffect(() => {
    updateTimer.current = setInterval(processPendingUpdates, 300); // Process updates every 300ms
    return () => clearInterval(updateTimer.current);
  }, [processPendingUpdates]);

  useEffect(() => {
    socketRef.current = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('connect_error', () => {
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('presence_update', (data: any) => {
      setOnlineCount(data.onlineCount);
    });

    socketRef.current.on('online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    // Removed rates socket listener
    socketRef.current.on('headlines:updated', (data: any) => {
      pendingUpdates.current.headlines = data;
    });
    socketRef.current.on('config:updated', (data: any) => {
      pendingUpdates.current.config = data;
    });
    socketRef.current.on('users:updated', (data: User[]) => {
      pendingUpdates.current.users = data;
      
      // Immediate sync for currentUser if they were updated remotely (security/role changes)
      const savedUser = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (savedUser) {
        const current = JSON.parse(savedUser);
        const updatedMe = data.find(u => u.id === current.id);
        if (updatedMe && (updatedMe.role !== current.role || updatedMe.status !== current.status || updatedMe.expiresAt !== current.expiresAt)) {
          setCurrentUser(updatedMe);
          if (updatedMe.status === 'blocked') {
            alert('هەژمارەکەت ڕاگیراوە!');
            handleLogout();
          }
        }
      }
    });
    socketRef.current.on('transactions:updated', (data: any) => {
      pendingUpdates.current.transactions = data;
    });
    socketRef.current.on('products:updated', (data: any) => {
      pendingUpdates.current.products = data;
    });
    socketRef.current.on('categories:updated', (data: any) => {
      pendingUpdates.current.categories = data;
    });
    socketRef.current.on('support:updated', (data: any) => {
      pendingUpdates.current.support = data;
    });
    socketRef.current.on('ads:updated', (data: any) => {
      pendingUpdates.current.ads = data;
    });

    socketRef.current.on('admin:notification', (data: any) => {
      const id = Date.now().toString();
      setGlobalNotification({ id, ...data });
      setTimeout(() => {
        setGlobalNotification(prev => prev?.id === id ? null : prev);
      }, 5000);
    });

    socketRef.current.on('notifications:updated', (data: any) => {
      pendingUpdates.current.notifications = data;
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [processPendingUpdates]);

  useEffect(() => {
    if (currentUser && isConnected) {
      socketRef.current.emit('user_join', currentUser.id);
    }
  }, [currentUser, isConnected]);

  // Error Boundary style recovery
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message.includes('JSON') || e.message.includes('undefined') || e.message.includes('parse')) {
        console.warn("Detected critical error, but skipping auto-clear for persistence...");
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    lastEditTime.current = Date.now();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
      // Sync to DB
      const userId = currentUser?.id || 'guest';
      apiFetch(`/api/favorites?userId=${userId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(next.map(itemId => ({ id: itemId, itemId }))) 
      }).catch(console.error);
      return next;
    });
  }, [currentUser]);

  const handleUpdateFavorites = useCallback((newFavorites: string[] | ((prev: string[]) => string[])) => {
    lastEditTime.current = Date.now();
    setFavorites(prev => {
      const next = typeof newFavorites === 'function' ? newFavorites(prev) : newFavorites;
      localStorage.setItem(`${STORAGE_KEY}_favorites`, JSON.stringify(next));
      const userId = currentUser?.id || 'guest';
      apiFetch(`/api/favorites?userId=${userId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(next.map(itemId => ({ id: itemId, itemId }))) 
      }).catch(console.error);
      return next;
    });
  }, [STORAGE_KEY, currentUser]);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    const data = safeParse(saved, []);
    return Array.isArray(data) ? data : [];
  });

  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_app_notifications`);
    return safeParse(saved, []);
  });

  const handleUpdateAppNotifications = useCallback((newNotifs: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    setAppNotifications(prev => {
      const next = typeof newNotifs === 'function' ? newNotifs(prev) : newNotifs;
      localStorage.setItem(`${STORAGE_KEY}_app_notifications`, JSON.stringify(next));
      if (socketRef.current) socketRef.current.emit('notifications:update', next);
      apiFetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      return next;
    });
  }, [STORAGE_KEY]);

  const [ads, setAds] = useState<Ad[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ads`);
    return safeParse(saved, []);
  });

  const handleUpdateAds = useCallback((newAds: Ad[] | ((prev: Ad[]) => Ad[])) => {
    setAds(prev => {
      const next = typeof newAds === 'function' ? newAds(prev) : newAds;
      addLog(next.length > prev.length ? 'add' : 'delete', 'ad', `Ads updated. Total: ${next.length}`);
      localStorage.setItem(`${STORAGE_KEY}_ads`, JSON.stringify(next));
      
      // Sync to DB
      apiFetch('/api/ads', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(next) 
      }).then(() => {
        if (socketRef.current) {
          socketRef.current.emit('ads:update', next);
        }
      }).catch(console.error);
      
      return next;
    });
  }, [STORAGE_KEY]);

  const handleSendNotification = useCallback((notification: { title: string, message: string, type: 'info'|'success'|'warning'|'error' }, isGlobal = true) => {
    if (isGlobal) {
      // Broadcast to everyone via socket
      if (socketRef.current) {
        socketRef.current.emit('admin:notification', notification);
      }
      
      // Save to notification history for everyone to see later
      const newNotif: AppNotification = {
        id: Date.now().toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date().toISOString(),
        readBy: []
      };
      handleUpdateAppNotifications(prev => [newNotif, ...prev]);
    } else {
      // Show ONLY locally to the admin (e.g., "Sent successfully" message)
      const id = Date.now().toString();
      setGlobalNotification({ id, ...notification });
      setTimeout(() => {
        setGlobalNotification(prev => prev?.id === id ? null : prev);
      }, 5000);
    }
  }, [handleUpdateAppNotifications]);

  // Removed update rates/metals handlers

  const handleUpdateHeadlines = useCallback((newHeadlines: Headline[] | ((prev: Headline[]) => Headline[])) => {
    lastEditTime.current = Date.now();
    setHeadlines(prev => {
      const next = typeof newHeadlines === 'function' ? newHeadlines(prev) : newHeadlines;
      addLog('update', 'headline', `Headlines updated. Total: ${next.length}`);
      localStorage.setItem(`${STORAGE_KEY}_news`, JSON.stringify(next));
      apiFetch('/api/news', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('headlines:update', next);
      return next;
    });
  }, [STORAGE_KEY]);

  // Handle persistence of live edits (news only now)
  useEffect(() => {
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.hasAttribute !== 'function' || !target.hasAttribute('data-edit-id')) return;

      const id = target.getAttribute('data-edit-id');
      const type = target.getAttribute('data-edit-type');
      const newValue = target.innerText.trim();

      if (!id || !type || !newValue) return;

      if (type === 'headline') {
        handleUpdateHeadlines(prev => prev.map(h => h.id === id ? { ...h, text: newValue } : h));
      }
    };

    window.addEventListener('blur', handleBlur, true);
    return () => window.removeEventListener('blur', handleBlur, true);
  }, [handleUpdateHeadlines]);

  const handleUpdateConfig = useCallback((newConfig: AppConfig) => {
    lastEditTime.current = Date.now();
    setConfig(prev => {
      const next = { ...prev, ...newConfig };
      addLog('update', 'config', `System configuration updated`);
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(next));
      apiFetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('config:update', next);
      return next;
    });
  }, [STORAGE_KEY]);

  const handleRestoreDefaults = useCallback(async () => {
    lastEditTime.current = Date.now();
    // Rates restore removed
    addNotification('هەموو داتاکان گەڕانەوە بۆ باری سەرەتایی', 'info');
  }, [addNotification]);

  const handleUpdateUsers = useCallback((newUsers: User[] | ((prev: User[]) => User[])) => {
    lastEditTime.current = Date.now();
    setUsers(prev => {
      const next = typeof newUsers === 'function' ? newUsers(prev) : newUsers;
      addLog('update', 'user', `User list updated. Total: ${next.length}`);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(next));
      apiFetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('users:update', next);
      
      // Sync currentUser if they were updated
      if (currentUser) {
        const updatedMe = next.find(u => u.id === currentUser.id);
        if (updatedMe) {
          setCurrentUser(updatedMe);
          localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedMe));
        }
      }
      
      return next;
    });
  }, [currentUser, STORAGE_KEY]);

  const handleUpdateTransactions = useCallback((newTransactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    if (!hasRole(currentUser, ['admin', 'developer', 'editor'])) return;
    lastEditTime.current = Date.now();
    setTransactions(prev => {
      const next = typeof newTransactions === 'function' ? newTransactions(prev) : newTransactions;
      addLog('edit', 'transaction', `Transactions list updated. Total: ${next.length}`);
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(next));
      apiFetch('/api/transactions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('transactions:update', next);
      return next;
    });
  }, [currentUser, STORAGE_KEY]);

  const handleUpdateProducts = useCallback((newProducts: Product[] | ((prev: Product[]) => Product[])) => {
    if (!hasRole(currentUser, ['admin', 'developer'])) return;
    lastEditTime.current = Date.now();
    setProducts(prev => {
      const next = typeof newProducts === 'function' ? newProducts(prev) : newProducts;
      
      // Basic log for now
      addLog('edit', 'product', `Products list updated. Total: ${next.length}`);
      
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(next));
      apiFetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('products:update', next);
      return next;
    });
  }, [currentUser, STORAGE_KEY]);

  const handleUpdateCategories = useCallback((newCategories: Category[] | ((prev: Category[]) => Category[])) => {
    if (!hasRole(currentUser, ['admin', 'developer'])) return;
    lastEditTime.current = Date.now();
    setCategories(prev => {
      const next = typeof newCategories === 'function' ? newCategories(prev) : newCategories;
      addLog('edit', 'category', `Categories list updated. Total: ${next.length}`);
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(next));
      apiFetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('categories:update', next);
      return next;
    });
  }, [currentUser, STORAGE_KEY]);

  const handleAddReplyToTicket = (ticketId: string, message: string) => {
    if (!currentUser) return;
    handleUpdateSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          replies: [...t.replies, {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            message,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return t;
    }));
  };

  const handleUpdateSupportTickets = useCallback((newTickets: SupportTicket[] | ((prev: SupportTicket[]) => SupportTicket[])) => {
    lastEditTime.current = Date.now();
    setSupportTickets(prev => {
      const next = typeof newTickets === 'function' ? newTickets(prev) : newTickets;
      addLog('update', 'ticket', `Support tickets updated. Total: ${next.length}`);
      apiFetch('/api/support_tickets', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(console.error);
      socketRef.current.emit('support:update', next);
      return next;
    });
  }, [addLog]);



  // Fetch users from Local API
  useEffect(() => {
    const fetchUsers = async () => {
      if (Date.now() - lastEditTime.current < 5000) return;
      try {
        const response = await apiFetch('/api/users');
        const contentType = response.headers.get("content-type");
        
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            
            // Sync currentUser if they are in the list
            if (currentUser) {
              const updatedMe = data.find((u: any) => u.id === currentUser.id);
              if (updatedMe && JSON.stringify(updatedMe) !== JSON.stringify(currentUser)) {
                setCurrentUser(updatedMe);
                localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(updatedMe));
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch users (network error):", err);
      }
    };
    
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const saveUsersToApi = async (updatedUsers: User[]) => {
    try {
      await apiFetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });
    } catch (err) {
      console.error("Failed to save users to API:", err);
    }
  };

  const handleSetLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    localStorage.setItem(`${STORAGE_KEY}_lang`, newLang);
    if (currentUser) {
      handleUpdateUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, language: newLang } : u));
    }
  };

  // Sync lang from currentUser on login
  useEffect(() => {
    if (currentUser) {
      if (currentUser.language && currentUser.language !== language) {
        setLanguage(currentUser.language as LanguageCode);
      }
    }
  }, [currentUser?.id]);

  // Fetch all data from Local API
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (Date.now() - lastEditTime.current < 10000) return; // Increased guard to 10s
      try {
        // Removed market data fetches (rates, news, ads, etc. cleaned up separately)

        // Fetch Config
        const configRes = await apiFetch('/api/config');
        if (configRes.ok) {
          const contentType = configRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await configRes.json();
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              setConfig(prev => {
                const next = { ...DEFAULT_CONFIG, ...prev, ...data };
                return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
              });
            }
          }
        }

        // Fetch Transactions
        const transRes = await apiFetch('/api/transactions');
        if (transRes.ok) {
          const data = await transRes.json();
          if (Array.isArray(data)) {
            const processed = data.map(t => ({
              ...t,
              total: t.total || (t.amount * t.price) || 0
            }));
            setTransactions(prev => JSON.stringify(prev) !== JSON.stringify(processed) ? processed : prev);
          }
        }

        // Fetch Products
        const prodRes = await apiFetch('/api/products');
        if (prodRes.ok) {
          const data = await prodRes.json();
          if (Array.isArray(data)) {
            setProducts(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        }

        // Fetch Support Tickets
        const supportRes = await apiFetch('/api/support_tickets');
        if (supportRes.ok) {
          const data = await supportRes.json();
          if (Array.isArray(data)) {
            setSupportTickets(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        }

        // Fetch Categories
        const catRes = await apiFetch('/api/categories');
        if (catRes.ok) {
          const data = await catRes.json();
          if (Array.isArray(data)) {
            setCategories(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        }

        // Fetch Favorites
        const userId = currentUser?.id || 'guest';
        const favRes = await apiFetch(`/api/favorites?userId=${userId}`);
        if (favRes.ok) {
          const data = await favRes.json();
          if (Array.isArray(data)) {
            const favIds = data.map(f => f.itemId || f.id);
            setFavorites(prev => JSON.stringify(prev) !== JSON.stringify(favIds) ? favIds : prev);
          }
        }

        // Fetch Ads
        const adsRes = await apiFetch('/api/ads');
        if (adsRes.ok) {
          const data = await adsRes.json();
          if (Array.isArray(data)) {
            setAds(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        }

        // Fetch Notifications
        const notifsRes = await apiFetch('/api/notifications');
        if (notifsRes.ok) {
          const data = await notifsRes.json();
          if (Array.isArray(data)) {
            setAppNotifications(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        }

      } catch (err) {
        console.error("Local API fetch error:", err);
      }
    };

    fetchData();
    // Poll for updates every 60 seconds as a fallback (WebSockets handle real-time)
    const interval = setInterval(fetchData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.id, STORAGE_KEY]);

  // Global Error Handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      addNotification(`Error: ${event.message}`, 'error');
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason);
      // Ignore common benign WebSocket errors
      if (reason.includes('WebSocket closed without opened') || 
          reason.includes('transport error') ||
          reason.includes('xhr poll error')) {
        console.warn('Ignored Promise Rejection:', reason);
        return;
      }
      addNotification(`Promise Error: ${reason}`, 'error');
    };

    const handleJsonError = (event: Event) => {
       const customEvent = event as CustomEvent;
       addNotification(`JSON Error: ${customEvent.detail?.message || 'Unknown JSON error'}`, 'error');
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    window.addEventListener('json-parse-error' as any, handleJsonError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('json-parse-error' as any, handleJsonError);
    };
  }, [addNotification]);

  // Removed tiny jitter effect for rates

  // --- PERSISTENCE & THEME ---
  // Split persistence into smaller effects to avoid massive localStorage writes on every small change
  
  // Theme & Config Persistence
  useEffect(() => {
    try {
      const root = document.documentElement;
      const effectiveTheme = 'dark';
      
      root.className = effectiveTheme;
      document.body.className = effectiveTheme;
      
      root.style.setProperty('--primary-color', config.primaryColor);
      
      root.style.setProperty('--bg-color', '#0f172a');
      root.style.setProperty('--card-color', '#1e293b');
      root.style.setProperty('--text-color', '#f8fafc');
      
      root.style.setProperty('--app-radius', `${config.borderRadius}px`);
      root.style.setProperty('--app-font-size', `${config.fontSize}px`);
      root.style.setProperty('--app-font-family', config.fontFamily || 'Inter');
      root.style.setProperty('--gold-text-font', config.goldTextFont || 'Playfair Display');
      root.style.fontSize = `${config.fontSize}px`;
      root.style.fontFamily = config.fontFamily || 'Inter';
      
      localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
    } catch (error) {
      console.error("Error in theme/config effect:", error);
    }
  }, [theme, config, STORAGE_KEY]);

  // Language Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lang`, language);
  }, [language, STORAGE_KEY]);

  // Removed rates and news persistence effects (news handled via API)

  // Favorites Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_favorites`, JSON.stringify(favorites));
  }, [favorites, STORAGE_KEY]);

  // Removed crypto rates sync effect

  // User Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser || null));
  }, [currentUser, STORAGE_KEY]);

  // Other Data Persistence
  useEffect(() => {
    if (transactions.length > 0) localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    if (products.length > 0) localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    if (categories.length > 0) localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [transactions, products, categories, STORAGE_KEY]);

  // Check for user expiration
  useEffect(() => {
    if (!currentUser || !currentUser.expiresAt) return;

    const checkExpiration = () => {
      try {
        const expDate = new Date(currentUser.expiresAt!);
        if (isNaN(expDate.getTime())) return; // Ignore invalid dates
        if (expDate < new Date()) {
          alert('کاتەکەت تەواو بووە! تکایە پەیوەندی بە ئەدمینەوە بکە.');
          setCurrentUser(null);
          localStorage.removeItem(`${STORAGE_KEY}_user`);
        }
      } catch (e) {
        console.error("Invalid expiration date", e);
      }
    };

    checkExpiration(); // Check immediately
    const timer = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [currentUser]);

  const handleDeleteTransaction = useCallback((id: string) => {
    handleUpdateTransactions(prev => prev.filter(tx => tx.id !== id));
  }, [handleUpdateTransactions]);

  const handleRegister = useCallback((newUser: User) => {
    const userWithApprovedStatus = { ...newUser, status: 'approved' as const };
    handleUpdateUsers(prev => [userWithApprovedStatus, ...prev]);
    setCurrentUser(userWithApprovedStatus);
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(userWithApprovedStatus));
  }, [handleUpdateUsers]);

  const handleUpdateProfile = useCallback(async (updatedUser: User) => {
    handleUpdateUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, [handleUpdateUsers]);

  const handleAddSupportTicket = useCallback((ticket: SupportTicket) => {
    handleUpdateSupportTickets(prev => [{ ...ticket, ticketNumber: Math.max(...prev.map(t => t.ticketNumber), 0) + 1 }, ...prev]);
  }, [handleUpdateSupportTickets]);

  const handleAddTransaction = useCallback((newTx: Transaction) => {
    handleUpdateTransactions(prev => [...prev, newTx]);
  }, [handleUpdateTransactions]);

  const handleUpdateTransaction = useCallback((updatedTx: Transaction) => {
    handleUpdateTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
  }, [handleUpdateTransactions]);

  const handleSetView = useCallback((newView: ViewMode) => {
    if (newView === 'accounting' && currentUser && !hasRole(currentUser, ['VIP+', 'admin', 'developer'])) {
      addNotification('ئەم بەشە تەنها بۆ بەشداربووانی VIP+ بەردەستە', 'error');
      return;
    }
    setView(newView);
  }, [currentUser, addNotification]);
  const handleBackToSettings = useCallback(( ) => setView('settings'), []);

  const mainContent = useMemo(() => {
    if (!currentUser && (view === 'admin' || view === 'developer' || view === 'settings' || view === 'accounts' || view === 'kargeri' || view === 'editor')) {
      return <Login users={users} onLogin={(user) => {
        if (user.status === 'blocked') {
          addNotification(t('account_suspended'), 'error');
          return;
        }
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
        setCurrentUser(user);
        setUsers(prev => {
          if (!prev.some(u => u.id === user.id)) return [user, ...prev];
          return prev;
        });
      }} onRegister={handleRegister} t={t} config={config} onSwitch={()=>{}} />;
    }
    
    switch (view) {
        case 'admin': 
          return (
            <ErrorBoundary>
              <AdminDashboard 
                users={users}
                onlineUsers={onlineUsers} 
                headlines={headlines} 
                transactions={transactions} 
                products={products} 
                categories={categories} 
                supportTickets={supportTickets} 
                onUpdateUsers={handleUpdateUsers} 
                onUpdateHeadlines={handleUpdateHeadlines} 
                onUpdateTransactions={handleUpdateTransactions} 
                onUpdateProducts={handleUpdateProducts} 
                onUpdateCategories={handleUpdateCategories} 
                onUpdateSupportTickets={handleUpdateSupportTickets} 
                onDeleteTransaction={handleDeleteTransaction} 
                t={t} 
                currentUser={currentUser!} 
                config={config} 
                onUpdateConfig={handleUpdateConfig} 
                onSendNotification={handleSendNotification} 
              />
            </ErrorBoundary>
          );
        case 'accounts': 
          return (
            <ErrorBoundary>
              <AccountsView 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction} 
                onUpdateTransaction={handleUpdateTransaction} 
                onDeleteTransaction={handleDeleteTransaction} 
                products={products} 
                onUpdateProducts={handleUpdateProducts} 
                categories={categories} 
                onUpdateCategories={handleUpdateCategories} 
                currentUser={currentUser!} 
                config={config} 
                onUpdateConfig={handleUpdateConfig} 
                t={t} 
                onBack={handleBackToSettings} 
              />
            </ErrorBoundary>
          );
        case 'kargeri': 
          return <KargeriDashboard users={users} transactions={transactions} t={t} config={config} />;
        case 'editor': 
          return (
            <ErrorBoundary>
              <EditorDashboard 
                headlines={headlines} 
                onUpdateHeadlines={handleUpdateHeadlines} 
                t={t} 
                config={config} 
                onUpdateConfig={handleUpdateConfig} 
                currentUser={currentUser!} 
              />
            </ErrorBoundary>
          );
        case 'developer': 
          return (
            <DeveloperView 
              config={config} 
              onUpdateConfig={handleUpdateConfig} 
              headlines={headlines} 
              supportTickets={supportTickets} 
              logs={logs} 
              onUpdateHeadlines={handleUpdateHeadlines} 
              onUpdateSupportTickets={handleUpdateSupportTickets} 
              onAddReplyToTicket={handleAddReplyToTicket} 
              onRestoreDefaults={handleRestoreDefaults} 
              t={t} 
              language={language} 
              onDisableDevMode={() => { handleLogout(); setView('accounting'); }} 
            />
          );
        case 'settings': 
          return (
            <SettingsView 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateProfile} 
              onViewChange={setView} 
              onLogout={handleLogout} 
              language={language} 
              setLanguage={handleSetLanguage} 
              t={t} 
              config={config} 
              onUpdateConfig={handleUpdateConfig} 
              onAddSupportTicket={handleAddSupportTicket} 
              onAddReplyToTicket={handleAddReplyToTicket} 
              supportTickets={supportTickets} 
              deferredPrompt={deferredPrompt}
              onInstall={handleInstallClick}
            />
          );
        case 'wallet':
          return <ErrorBoundary><WalletView currentUser={currentUser} onUpdateUser={handleUpdateProfile} t={t} /></ErrorBoundary>;
        case 'activity': 
          return <ErrorBoundary><ActivityRanking users={users} onlineUsers={onlineUsers} currentUser={currentUser} onUpdateUsers={handleUpdateUsers} config={config} onUpdateConfig={handleUpdateConfig} /></ErrorBoundary>;
        case 'ads': 
          return <ErrorBoundary><AdsManager ads={ads} setAds={handleUpdateAds} /></ErrorBoundary>;
        case 'notifications': 
          return <ErrorBoundary><NotificationsView notifications={appNotifications} currentUser={currentUser} onUpdateNotifications={handleUpdateAppNotifications} /></ErrorBoundary>;
        case 'features': 
          return <AboutView config={config} t={t} onBack={() => setView('settings')} currentUser={currentUser} onAddSupportTicket={handleAddSupportTicket} />;
        case 'accounting':
          return null; // Rendered outside useMemo to avoid volatile re-renders
        default: 
          return <div className="flex items-center justify-center h-64 text-slate-500 font-bold uppercase tracking-widest">Select View</div>;

      }
  }, [view, currentUser, users, headlines, transactions, products, categories, supportTickets, ads, appNotifications, favorites, toggleFavorite, deferredPrompt, t, config, isConnected, onlineCount, onlineUsers, logs, language, handleUpdateUsers, handleUpdateHeadlines, handleUpdateTransactions, handleUpdateProducts, handleUpdateCategories, handleUpdateSupportTickets, handleDeleteTransaction, handleAddTransaction, handleUpdateTransaction, handleAddReplyToTicket, handleRestoreDefaults, handleUpdateProfile, handleSetLanguage, handleInstallClick, handleLogout, handleBackToSettings, handleSetView, addNotification]);

  // --- WELCOME & SPLASH SCREENS ---
  if (appState === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
          <img 
            src={config.customLogo || `/golden-logo.jpg?v=${config.logoVersion || '1'}`} 
            alt="Logo" 
            className="w-20 h-20 rounded-3xl object-cover shadow-[0_0_30px_rgba(212,175,55,0.4)] relative z-10 border-2 border-white/20"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== FALLBACK_GOLDEN_LOGO) {
                target.src = FALLBACK_GOLDEN_LOGO;
              }
            }}
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {t('welcome_to')} <span className="text-amber-400">گۆڵدن ئێکسچەینج</span>
        </h1>
        <p className="text-slate-400 mb-12 text-lg max-w-md">
          {t('welcome_desc')}
        </p>
        <button 
          onClick={() => {
            try {
              localStorage.setItem('golden_v21_has_seen_welcome', 'true');
            } catch (e) {
              console.warn("Failed to set welcome flag:", e);
            }
            setAppState('splash');
          }}
          className="group relative px-8 py-4 bg-amber-500 text-slate-900 font-black text-xl rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t('start')} <TrendingUp size="1.25rem" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    );
  }

  if (appState === 'splash') {
    return (
      <div 
        onClick={() => setAppState('main')} // Fallback: click to enter
        className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Background effects */}
          <div className="absolute -inset-20 bg-amber-500/20 blur-[100px] rounded-full animate-pulse"></div>
          
          {/* Main Logo with sliding animation */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 80, duration: 1 }}
            className="relative z-10"
          >
            <img 
              src={config?.splashLogo || config?.customLogo || `/golden-logo.jpg?v=${config?.logoVersion || '1'}`} 
              alt="Logo" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] shadow-[0_0_50px_rgba(245,158,11,0.4)] border-4 border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== FALLBACK_GOLDEN_LOGO) {
                  target.src = FALLBACK_GOLDEN_LOGO;
                }
              }}
            />
            {/* Shine effect */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            />
          </motion.div>
        </div>
      </div>
    );
  }


  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <Login users={users} onLogin={(user) => {
            if (user.status === 'blocked') {
              alert(t('account_suspended'));
              return;
            }
            console.log("App.tsx received user from Login:", user);
            localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
            setCurrentUser(user);
            setUsers(prev => {
              if (!prev.some(u => u.id === user.id)) return [user, ...prev];
              return prev;
            });
          }} onRegister={handleRegister} onSwitch={()=>{}} t={t} config={config} />
        </div>
      </div>
    );
  }

  if (config.maintenanceMode && !hasRole(currentUser, ['admin', 'developer'])) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-8 border border-red-500/50">
          <LucideIcons.AlertTriangle size={48} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">{t('maintenance_mode') || 'Maintenance Mode'}</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The application is currently undergoing scheduled maintenance. We'll be back online shortly.
        </p>
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col font-sans transition-all duration-300 overflow-x-hidden relative" style={{ fontSize: `${config.globalFontSize || 12}px` }}>
      {/* Notifications */}
      <div className="fixed top-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-top-full duration-500 pointer-events-auto max-w-md w-full">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
               n.type === 'up' ? 'bg-emerald-500/20 text-emerald-500' : 
               n.type === 'down' ? 'bg-rose-500/20 text-rose-500' :
               n.type === 'error' ? 'bg-red-500/20 text-red-500' :
               'bg-blue-500/20 text-blue-500'
             }`}>
               {n.type === 'up' ? <TrendingUp size="1rem" /> : 
                n.type === 'down' ? <TrendingDown size="1rem" /> :
                n.type === 'error' ? <Shield size="1rem" /> :
                <Activity size="1rem" />}
             </div>
             <div className="flex-1">
               <p className="text-xs font-black leading-relaxed">{n.text}</p>
             </div>
             <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors">
               <X size="0.875rem" />
             </button>
          </div>
        ))}
      </div>

      {/* Immersive Background - Optimized for performance */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 px-6 py-4 flex justify-between items-center shadow-lg relative">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('accounting')}>
          <img 
            src={config.customLogo || `/golden-logo.jpg?v=${config.logoVersion || '1'}`} 
            alt="Logo" 
            className="w-8 h-8 rounded-xl object-cover shadow-xl group-hover:scale-105 transition-transform border border-white/10"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== FALLBACK_GOLDEN_LOGO) {
                target.src = FALLBACK_GOLDEN_LOGO;
              }
            }}
          />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none crafted-title">{config.appName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full shadow-lg ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-rose-500 shadow-rose-500/50'}`} />
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 px-1 rounded-sm tracking-widest uppercase">ڕاستەوخۆ</span>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest crafted-label">
                  {isConnected ? `${onlineCount} ${t('online')}` : t('connection_lost')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button onClick={() => handleSetView('notifications')} className={`p-3 rounded-app transition-all relative ${view === 'notifications' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
            <Bell size="1.25rem" />
            {appNotifications.filter(n => !n.readBy.includes(currentUser.id)).length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>
          
          {currentUser && hasRole(currentUser, ['developer', 'admin', 'staff', 'moderator', 'kargeri', 'editor']) && (config.enableAdminPanel !== false) && (
            <button onClick={() => handleSetView('admin')} className={`p-3 rounded-app transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Shield size="1.25rem" />
            </button>
          )}
          {config.isRankingVisible !== false && (
            <button onClick={() => handleSetView('activity')} className={`p-3 rounded-app transition-all ${view === 'activity' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Trophy size="1.25rem" />
            </button>
          )}
          {currentUser && hasRole(currentUser, 'developer') && (
            <button onClick={() => handleSetView('ads')} className={`p-3 rounded-app transition-all ${view === 'ads' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <ImageIcon size="1.25rem" />
            </button>
          )}
          {currentUser && hasRole(currentUser, ['developer', 'kargeri']) && (
            <button onClick={() => handleSetView('kargeri')} className={`p-3 rounded-app transition-all ${view === 'kargeri' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Activity size="1.25rem" />
            </button>
          )}
          {currentUser && hasRole(currentUser, ['developer', 'editor']) && (
            <button onClick={() => handleSetView('editor')} className={`p-3 rounded-app transition-all ${view === 'editor' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Edit3 size="1.25rem" />
            </button>
          )}
          {currentUser && hasRole(currentUser, 'developer') && (
            <button onClick={() => handleSetView('developer')} className={`p-3 rounded-app transition-all ${view === 'developer' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              <Cpu size="1.25rem" />
            </button>
          )}
          <button onClick={() => handleSetView('settings')} className={`p-3 rounded-app transition-all ${view === 'settings' ? 'bg-primary text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
            <Settings size="1.25rem" />
          </button>
        </div>
      </header>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className="fixed top-6 left-4 right-4 z-[10000] bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                <img src="/golden-logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[0.9rem]" />
              </div>
              <div className="text-right">
                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight">داگرتنی ئەپڵیکەیشن</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">بۆ خێرایی و کارایی زیاتر ئەپەکە دابەزێنە</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleInstallClick}
                className="px-6 py-3 bg-amber-500 text-black text-xs font-black rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/30 uppercase italic"
              >
                {isIOS ? 'چۆنیەتی دابەزاندن' : 'دابەزاندن'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Admin Notification */}
      <AnimatePresence>
        {globalNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
          >
            <div className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-4 shadow-2xl ${
              globalNotification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20' :
              globalNotification.type === 'warning' ? 'bg-amber-500/20 border-amber-500/50 shadow-amber-500/20' :
              globalNotification.type === 'error' ? 'bg-rose-500/20 border-rose-500/50 shadow-rose-500/20' :
              'bg-blue-500/20 border-blue-500/50 shadow-blue-500/20'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <div className="relative flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  globalNotification.type === 'success' ? 'bg-emerald-500 text-white' :
                  globalNotification.type === 'warning' ? 'bg-amber-500 text-white' :
                  globalNotification.type === 'error' ? 'bg-rose-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  <Bell size={24} className="animate-bounce" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-white font-black text-lg leading-tight mb-1 drop-shadow-md">{globalNotification.title}</h3>
                  <p className="text-white/90 font-bold text-sm leading-snug drop-shadow-sm">{globalNotification.message}</p>
                </div>
                <button onClick={() => setGlobalNotification(null)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto pb-32 pt-6 px-4 md:px-12 no-scrollbar">
        {view === 'accounting' && <AdsBanner ads={ads} config={config} />}
        
        {view === 'accounting' ? (
          <ErrorBoundary>
            <GoldenAccounting 
              config={config} 
              language={language} 
              t={t} 
              currentUser={currentUser} 
              onUserLogin={(user) => {
                setCurrentUser(user);
                setUsers(prev => {
                  if (!prev.some(u => u.id === user.id)) return [user, ...prev];
                  return prev.map(u => u.id === user.id ? user : u);
                });
                localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
              }}
            />
          </ErrorBoundary>
        ) : (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">{t('please_wait') || 'تکایە چاوەڕێ بکە...'}</p>
            </div>
          }>
            {mainContent}
          </Suspense>
        )}
      </main>

      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-rose-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            تۆ ئێستا بە بێ ئینتەرنێت کار دەکەیت
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/30 dark:border-white/10 p-2 flex justify-around items-center rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] z-[110]">
        {[
          { id: 'accounting', icon: LucideIcons.Calculator },
          { id: 'wallet', icon: LucideIcons.Wallet },
          { id: 'settings', icon: LucideIcons.Settings },
        ].filter(item => {
          if (item.id === 'accounting') {
            if (!currentUser) return true; // Show for guests (might be employees)
            return hasRole(currentUser, ['VIP+', 'admin', 'developer']);
          }
          return config.enabledTabs?.includes(item.id) ?? true;
        }).map((item) => {
          const IconComponent = (LucideIcons as any)[config.tabIcons?.[item.id] as any] || item.icon;
          const tabName = config.tabNames?.[item.id] || t(item.id);
          return (
            <button 
              key={item.id} 
              onClick={() => setView(item.id as ViewMode)} 
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${view === item.id ? 'bg-primary text-white shadow-lg -translate-y-1' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {config.tabIcons?.[item.id]?.startsWith('data:image') || config.tabIcons?.[item.id]?.startsWith('http') ? (
                <img src={config.tabIcons[item.id]} alt={item.id} className="w-6 h-6 object-cover rounded-lg shadow-sm" referrerPolicy="no-referrer" />
              ) : (
                <IconComponent size="1.5rem" strokeWidth={2.5} />
              )}
              <span className="text-[0.5rem] font-bold mt-1 leading-tight">{tabName}</span>
            </button>
          )}
        )}
      </nav>

      {/* DevModMenu removed */}
    </div>
  );
};

export default App;
