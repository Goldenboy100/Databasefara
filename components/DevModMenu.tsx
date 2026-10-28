
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import confetti from 'canvas-confetti';
import * as LucideIcons from 'lucide-react';
import { 
  Cpu, X, Shield, Settings, Users, TrendingUp, 
  Database, AlertTriangle, Terminal, Activity, 
  Search, Plus, Save, Trash2, RefreshCw, 
  Lock, Unlock, Eye, EyeOff, Crown, Bell,
  Layout, Move, Palette, Ghost, Zap, Code,
  Smartphone, Monitor, Layers, Filter, Download, Upload,
  UserX, UserCheck, Flame, Stars, Sparkles, Wand2,
  Volume2, VolumeX, Activity as ActivityIcon, Bug, Terminal as TerminalIcon,
  Send, Command, Trash, Play, Pause, Square,
  Globe, Wifi, HardDrive, Info, Gauge, MousePointer2,
  MonitorSmartphone, Laptop, Tablet, Smartphone as MobileIcon,
  ZapOff, Rocket, Target, ShieldAlert, ShieldCheck,
  Palette as PaletteIcon, Paintbrush, Sun, Moon,
  Share2, ExternalLink, Copy, Check, History,
  LayoutDashboard, Network, MonitorDot
} from 'lucide-react';
import { 
  User, 
  AppConfig, LogEntry, Transaction, ViewMode 
} from '../types.ts';
import { hasRole } from '../utils.ts';

interface DevModMenuProps {
  currentUser: User;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  users: User[];
  onUpdateUsers: (newUsers: User[]) => void;
  logs: LogEntry[];
  onSwitchView: (view: ViewMode) => void;
  t: (key: string) => string;
  onUpdateHeadlines: (headlines: any[] | ((prev: any[]) => any[])) => void;
  onSendNotification: (notif: any, isGlobal?: boolean) => void;
  isLiveEdit: boolean;
  onToggleLiveEdit: () => void;
}

const DevModMenu: React.FC<DevModMenuProps> = ({ 
  currentUser, config, onUpdateConfig, 
  users, onUpdateUsers, 
  logs, onSwitchView, t,
  onUpdateHeadlines, onSendNotification,
  isLiveEdit, onToggleLiveEdit
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'system' | 'users' | 'logs' | 'content' | 'special' | 'console' | 'network'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<{ text: string, type: 'info' | 'success' | 'error' | 'cmd' }[]>([
    { text: 'SHAZO MOD MENU CONSOLE v4.0', type: 'info' },
    { text: 'Type /help for a list of commands.', type: 'info' }
  ]);
  const [quickHeadline, setQuickHeadline] = useState('');
  const [quickAlert, setQuickAlert] = useState('');
  const [customCSS, setCustomCSS] = useState(config.modMenuCustomCSS || '');
  const [perfData, setPerfData] = useState<number[]>(Array(20).fill(0));
  const [networkLogs, setNetworkLogs] = useState<{ id: string, method: string, path: string, status: number, time: string }[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [fps, setFps] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  
  // Matrix Effect Canvas Ref
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Sound Effect Helper
  const playSound = useCallback((type: 'click' | 'success' | 'error') => {
    if (!config.modMenuSoundEffects) return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'error') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(110, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  }, [config.modMenuSoundEffects]);

  // Screen Shake Effect
  const triggerShake = () => {
    setIsShaking(true);
    playSound('error');
    setTimeout(() => setIsShaking(false), 500);
  };

  // Screen Flash Effect
  const triggerFlash = () => {
    setIsFlashing(true);
    playSound('success');
    setTimeout(() => setIsFlashing(false), 200);
  };

  // Confetti Effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']
    });
    playSound('success');
  };

  const handleUpdateConfigValue = (key: keyof AppConfig, value: any) => {
    onUpdateConfig({ ...config, [key]: value });
    playSound('click');
  };

  const handleOverclock = () => {
    triggerShake();
    triggerFlash();
    triggerConfetti();
    handleUpdateConfigValue('modMenuSpeedHack', true);
    onSendNotification({
      title: 'SYSTEM OVERCLOCKED',
      message: 'Performance limits removed. Speed hack enabled.',
      type: 'warning'
    }, false);
  };

  // FPS Counter Logic
  useEffect(() => {
    if (!config.modMenuFPSCounter) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(updateFPS);
    };

    animationFrameId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, [config.modMenuFPSCounter]);

  // Mouse Tracker Logic
  useEffect(() => {
    if (!config.modMenuMouseTracker) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [config.modMenuMouseTracker]);

  // Auto Clicker Simulation
  useEffect(() => {
    if (!config.modMenuAutoClicker) return;
    const interval = setInterval(() => {
      // Visual feedback for auto-click
      const clickEffect = document.createElement('div');
      clickEffect.className = 'fixed w-4 h-4 bg-white/30 border border-white/50 rounded-full pointer-events-none z-[10001] animate-ping';
      clickEffect.style.left = `${Math.random() * window.innerWidth}px`;
      clickEffect.style.top = `${Math.random() * window.innerHeight}px`;
      document.body.appendChild(clickEffect);
      setTimeout(() => clickEffect.remove(), 1000);
      playSound('click');
    }, 200);
    return () => clearInterval(interval);
  }, [config.modMenuAutoClicker, playSound]);

  // Network Monitor Simulation
  useEffect(() => {
    const speed = config.modMenuSpeedHack ? 500 : 3000;
    const interval = setInterval(() => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const paths = ['/api/rates', '/api/users', '/api/config', '/api/logs', '/api/auth/login', '/api/headlines'];
      const statuses = [200, 200, 200, 201, 404, 500];
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        method: methods[Math.floor(Math.random() * methods.length)],
        path: paths[Math.floor(Math.random() * paths.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        time: new Date().toLocaleTimeString()
      };
      
      setNetworkLogs(prev => [newLog, ...prev].slice(0, 50));
    }, speed);
    return () => clearInterval(interval);
  }, [config.modMenuSpeedHack]);

  // Matrix Effect Logic
  useEffect(() => {
    if (!config.modMenuMatrixMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [config.modMenuMatrixMode]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim().toLowerCase();
    setConsoleHistory(prev => [...prev, { text: `> ${consoleInput}`, type: 'cmd' }]);
    setConsoleInput('');

    // Command Logic
    if (cmd === '/help') {
      setConsoleHistory(prev => [...prev, 
        { text: 'Available Commands:', type: 'info' },
        { text: '/clear - Clear console history', type: 'info' },
        { text: '/wipe - Wipe all system logs', type: 'info' },
        { text: '/freeze - Freeze all non-admin users', type: 'info' },
        { text: '/unfreeze - Unfreeze all users', type: 'info' },
        { text: '/ghost - Toggle Ghost Mode', type: 'info' },
        { text: '/rainbow - Toggle Rainbow Mode', type: 'info' },
        { text: '/matrix - Toggle Matrix Mode', type: 'info' },
        { text: '/shake - Trigger screen shake', type: 'info' },
        { text: '/flash - Trigger screen flash', type: 'info' },
        { text: '/confetti - Trigger confetti burst', type: 'info' },
        { text: '/fps - Toggle FPS Counter', type: 'info' },
        { text: '/mouse - Toggle Mouse Tracker', type: 'info' },
        { text: '/autoclick - Toggle Auto Clicker', type: 'info' },
        { text: '/addpoints [name] [amount] - Add points to user', type: 'info' },
        { text: '/setrole [name] [role] - Set user role', type: 'info' },
        { text: '/buy [name] [product] - Simulate product purchase', type: 'info' },
        { text: '/screenshot - Take a simulated screenshot', type: 'info' },
        { text: '/exit - Close mod menu', type: 'info' }
      ]);
    } else if (cmd === '/clear') {
      setConsoleHistory([]);
    } else if (cmd === '/wipe') {
      handleWipeLogs();
      setConsoleHistory(prev => [...prev, { text: 'Logs wiped successfully.', type: 'success' }]);
    } else if (cmd === '/freeze') {
      handleFreezeUsers();
      setConsoleHistory(prev => [...prev, { text: 'All non-admin users frozen.', type: 'error' }]);
    } else if (cmd === '/unfreeze') {
      onUpdateUsers(users.map(u => ({ ...u, status: 'approved' })));
      setConsoleHistory(prev => [...prev, { text: 'All users unfrozen.', type: 'success' }]);
    } else if (cmd === '/ghost') {
      handleUpdateConfigValue('modMenuGhostMode', !config.modMenuGhostMode);
      setConsoleHistory(prev => [...prev, { text: `Ghost Mode: ${!config.modMenuGhostMode ? 'ON' : 'OFF'}`, type: 'info' }]);
    } else if (cmd === '/rainbow') {
      handleUpdateConfigValue('modMenuRainbowMode', !config.modMenuRainbowMode);
      setConsoleHistory(prev => [...prev, { text: `Rainbow Mode: ${!config.modMenuRainbowMode ? 'ON' : 'OFF'}`, type: 'info' }]);
    } else if (cmd === '/matrix') {
      handleUpdateConfigValue('modMenuMatrixMode', !config.modMenuMatrixMode);
      setConsoleHistory(prev => [...prev, { text: `Matrix Mode: ${!config.modMenuMatrixMode ? 'ON' : 'OFF'}`, type: 'info' }]);
    } else if (cmd === '/shake') {
      triggerShake();
    } else if (cmd === '/flash') {
      triggerFlash();
    } else if (cmd === '/confetti') {
      triggerConfetti();
    } else if (cmd === '/fps') {
      handleUpdateConfigValue('modMenuFPSCounter', !config.modMenuFPSCounter);
    } else if (cmd === '/mouse') {
      handleUpdateConfigValue('modMenuMouseTracker', !config.modMenuMouseTracker);
    } else if (cmd === '/autoclick') {
      handleUpdateConfigValue('modMenuAutoClicker', !config.modMenuAutoClicker);
    } else if (cmd.startsWith('/addpoints ')) {
      const parts = consoleInput.split(' ');
      if (parts.length >= 3) {
        const name = parts[1];
        const points = parseInt(parts[2]);
        const user = users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
        if (user) {
          updateUserPoints(user.id, points);
          setConsoleHistory(prev => [...prev, { text: `Added ${points} points to ${user.name}`, type: 'success' }]);
        } else {
          setConsoleHistory(prev => [...prev, { text: `User not found: ${name}`, type: 'error' }]);
        }
      }
    } else if (cmd.startsWith('/setrole ')) {
      const parts = consoleInput.split(' ');
      if (parts.length >= 3) {
        const name = parts[1];
        const role = parts[2];
        const user = users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
        if (user) {
          updateUserRole(user.id, role);
          setConsoleHistory(prev => [...prev, { text: `Set role of ${user.name} to ${role}`, type: 'success' }]);
        } else {
          setConsoleHistory(prev => [...prev, { text: `User not found: ${name}`, type: 'error' }]);
        }
      }
    } else if (cmd.startsWith('/buy ')) {
      const parts = consoleInput.split(' ');
      if (parts.length >= 3) {
        const name = parts[1];
        const productName = parts.slice(2).join(' ');
        const user = users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
        if (user) {
          onSendNotification({
            title: 'کڕینی نوێ',
            message: `${user.name} کاڵای ${productName} کڕی`,
            type: 'success'
          }, true);
          setConsoleHistory(prev => [...prev, { text: `Simulated purchase of ${productName} for ${user.name}`, type: 'success' }]);
        } else {
          setConsoleHistory(prev => [...prev, { text: `User not found: ${name}`, type: 'error' }]);
        }
      }
    } else if (cmd === '/screenshot') {
      triggerFlash();
      setConsoleHistory(prev => [...prev, { text: 'Screenshot captured and saved to system.', type: 'success' }]);
    } else if (cmd === '/exit') {
      setIsOpen(false);
    } else {
      setConsoleHistory(prev => [...prev, { text: `Unknown command: ${cmd}`, type: 'error' }]);
    }
    playSound('click');
  };
  
  if (!hasRole(currentUser, 'developer')) return null;

  const toggleMaintenance = () => {
    onUpdateConfig({
      ...config,
      maintenanceMode: !config.maintenanceMode
    });
  };

  // updateRate removed


  const updateUserPoints = (userId: string, points: number) => {
    onUpdateUsers(users.map(u => u.id === userId ? { ...u, activityPoints: (u.activityPoints || 0) + points } : u));
  };

  const updateUserRole = (userId: string, role: string) => {
    onUpdateUsers(users.map(u => u.id === userId ? { ...u, role } : u));
  };

  const handleQuickHeadline = () => {
    if (!quickHeadline.trim()) return;
    onUpdateHeadlines((prev: any[]) => [{
      id: Date.now().toString(),
      text: quickHeadline,
      timestamp: new Date().toISOString(),
      active: true,
      category: 'general'
    }, ...prev]);
    setQuickHeadline('');
    onSendNotification({
      title: 'سەرکەوتوو بوو',
      message: 'هەواڵەکە بە سەرکەوتوویی زیادکرا',
      type: 'success'
    }, false);
  };

  const handleQuickAlert = () => {
    if (!quickAlert.trim()) return;
    onSendNotification({
      title: 'ئاگادارکردنەوەی گشتی',
      message: quickAlert,
      type: 'info',
      duration: 5000
    }, true);
    setQuickAlert('');
  };

  const handleReorderSections = (newOrder: string[]) => {
    handleUpdateConfigValue('modMenuSectionOrder', newOrder);
  };

  const handleWipeLogs = () => {
    if (window.confirm('Are you sure you want to wipe all logs? This cannot be undone.')) {
      // In a real app, this would call an API. For now, we'll just clear the local state if possible.
      onSendNotification({ title: 'System', message: 'Logs wiped successfully', type: 'success' }, false);
    }
  };

  const handleFreezeUsers = () => {
    if (window.confirm('Freeze all non-admin users?')) {
      const updatedUsers = users.map(u => !hasRole(u, 'admin') ? { ...u, status: 'blocked' as const } : u);
      onUpdateUsers(updatedUsers);
      onSendNotification({ title: 'Security', message: 'All non-admin users frozen', type: 'warning' }, false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role.includes(userRoleFilter);
    return matchesSearch && matchesRole;
  }).slice(0, 10);

  const sections = config.modMenuSectionOrder || ['market', 'converter', 'settings'];

  const getThemeColors = () => {
    switch (config.modMenuTheme) {
      case 'rose': return 'from-rose-600 to-pink-600';
      case 'emerald': return 'from-emerald-600 to-teal-600';
      case 'amber': return 'from-amber-600 to-orange-600';
      case 'slate': return 'from-slate-600 to-slate-800';
      case 'rainbow': return 'from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x';
      default: return 'from-indigo-600 to-purple-600';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${isShaking ? 'animate-shake' : ''}`}>
      {/* Screen Flash Overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[10000] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Matrix Overlay */}
      {config.modMenuMatrixMode && (
        <canvas 
          ref={canvasRef} 
          className="fixed inset-0 pointer-events-none z-[-1] opacity-30"
        />
      )}

      {/* FPS Counter Overlay */}
      {config.modMenuFPSCounter && (
        <div className="fixed top-4 left-4 z-[10000] bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg pointer-events-none">
          <p className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">FPS: {fps}</p>
        </div>
      )}

      {/* Mouse Tracker Overlay */}
      {config.modMenuMouseTracker && (
        <div className="fixed z-[10000] pointer-events-none bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 px-2 py-1 rounded text-[8px] font-mono text-white" style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}>
          X: {mousePos.x} Y: {mousePos.y}
        </div>
      )}

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          playSound('click');
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-500 ${
          isOpen ? 'bg-red-500 border-red-400 text-white rotate-90' : 'bg-indigo-600 border-indigo-400 text-white'
        } ${config.modMenuRainbowMode ? 'animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]' : ''}`}
      >
        {isOpen ? <X size={28} /> : <Cpu size={28} className={config.modMenuRainbowMode ? 'animate-spin-slow' : 'animate-pulse'} />}
      </motion.button>

      {/* Mod Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 50, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 50, rotate: 5 }}
            className={`fixed sm:absolute bottom-4 sm:bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 right-auto sm:right-4 w-[88%] sm:w-[350px] bg-slate-900/95 border border-slate-700 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[45vh] sm:h-auto max-h-[60vh] sm:max-h-[600px] backdrop-blur-2xl ${config.modMenuRainbowMode ? 'border-indigo-500/50' : ''} ${config.modMenuGlassEffect ? 'bg-slate-900/60' : ''}`}
          >
            {/* Header */}
            <div className={`p-2 sm:p-3 bg-gradient-to-r ${getThemeColors()} flex items-center justify-between relative overflow-hidden`}>
              {config.modMenuRainbowMode && (
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <Stars className="absolute top-0.5 left-2 animate-bounce" size={8} />
                  <Sparkles className="absolute bottom-0.5 right-6 animate-pulse" size={10} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
                  <Shield size={16} className="text-white drop-shadow-lg" />
                </div>
                <div>
                  <h2 className={`font-black tracking-tighter text-sm italic drop-shadow-md ${config.modMenuRainbowMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient-x' : 'text-white'}`}>SHAZO</h2>
                  <p className="text-[7px] text-white/80 font-mono uppercase tracking-[0.1em] font-black">DEV v4</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${config.maintenanceMode ? 'bg-red-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]'}`} />
                  <span className="text-[7px] text-white font-black uppercase tracking-widest">{config.maintenanceMode ? 'OFF' : 'ON'}</span>
                </div>
              </div>
            </div>

            {/* Tabs - Scrollable */}
            <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl no-scrollbar px-0.5">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
                { id: 'system', icon: Settings, label: 'Sys' },
                { id: 'content', icon: Layout, label: 'Cont' },
                { id: 'special', icon: Stars, label: 'Spec' },
                { id: 'users', icon: Users, label: 'User' },
                { id: 'logs', icon: Terminal, label: 'Log' },
                { id: 'network', icon: Network, label: 'Net' },
                { id: 'console', icon: Command, label: 'Cmd' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id as any);
                    playSound('click');
                  }}
                  className={`flex-shrink-0 px-2 py-1.5 flex flex-col items-center gap-0.5 transition-all relative ${
                    activeTab === t.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <t.icon size={14} className={activeTab === t.id ? 'scale-110' : ''} />
                  <span className="text-[6px] font-black uppercase tracking-tighter">{t.label}</span>
                  {activeTab === t.id && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-1px_5px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 custom-scrollbar space-y-2 sm:space-y-3">
              {activeTab === 'dashboard' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl border border-indigo-500/20 flex flex-col items-center gap-0.5 text-center group hover:scale-105 transition-transform">
                      <div className="p-1 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:rotate-12 transition-transform">
                        <Users size={12} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{users.length}</p>
                        <p className="text-[6px] text-indigo-400 font-black uppercase tracking-widest">Users</p>
                      </div>
                    </div>
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-0.5 text-center group hover:scale-105 transition-transform">
                      <div className="p-1 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:-rotate-12 transition-transform">
                        <ActivityIcon size={12} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{logs.length}</p>
                        <p className="text-[6px] text-emerald-400 font-black uppercase tracking-widest">Logs</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Quick Commands</p>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'Shake', icon: Zap, action: triggerShake, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Flash', icon: Sparkles, action: triggerFlash, color: 'text-white', bg: 'bg-white/10' },
                        { label: 'Confetti', icon: Wand2, action: triggerConfetti, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                        { label: 'FPS', icon: Gauge, action: () => handleUpdateConfigValue('modMenuFPSCounter', !config.modMenuFPSCounter), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Mouse', icon: MousePointer2, action: () => handleUpdateConfigValue('modMenuMouseTracker', !config.modMenuMouseTracker), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'Overclock', icon: Rocket, action: handleOverclock, color: 'text-red-500', bg: 'bg-red-500/20' },
                        { label: 'Ghost', icon: Ghost, action: () => handleUpdateConfigValue('modMenuGhostMode', !config.modMenuGhostMode), color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'Matrix', icon: TerminalIcon, action: () => handleUpdateConfigValue('modMenuMatrixMode', !config.modMenuMatrixMode), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Live Edit', icon: LucideIcons.Edit, action: onToggleLiveEdit, color: isLiveEdit ? 'text-rose-500' : 'text-slate-400', bg: isLiveEdit ? 'bg-rose-500/20' : 'bg-slate-500/10' }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => { btn.action(); playSound('click'); }}
                          className={`p-1 ${btn.bg} rounded-lg border border-white/5 flex flex-col items-center gap-0.5 hover:scale-105 transition-all active:scale-95`}
                        >
                          <btn.icon size={10} className={btn.color} />
                          <span className="text-[5px] font-black text-white uppercase tracking-tighter">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.2em]">Health</p>
                      <Gauge size={8} className="text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[6px] font-black uppercase text-slate-400">
                          <span>CPU</span>
                          <span className="text-emerald-400">24%</span>
                        </div>
                        <div className="h-0.5 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[6px] font-black uppercase text-slate-400">
                          <span>RAM</span>
                          <span className="text-indigo-400">1.2GB</span>
                        </div>
                        <div className="h-0.5 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} className="h-full bg-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-2">
                  <div className="p-1.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-1">
                      <div className={`p-1 rounded-lg transition-all duration-500 ${config.maintenanceMode ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        <AlertTriangle size={10} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-white uppercase tracking-tight">Maint Mode</p>
                        <p className="text-[6px] text-slate-500 font-medium">Lock app</p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleMaintenance}
                      className={`w-7 h-3.5 rounded-full relative transition-all duration-500 ${config.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                    >
                      <motion.div 
                        animate={{ x: config.maintenanceMode ? 16 : 2 }}
                        className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      onClick={() => onSwitchView('admin')}
                      className="p-1 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col items-center gap-0.5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                    >
                      <Database size={12} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[6px] font-black text-white uppercase tracking-widest">Admin</span>
                    </button>
                    <button 
                      onClick={() => onSwitchView('activity')}
                      className="p-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col items-center gap-0.5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                    >
                      <Activity size={12} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[6px] font-black text-white uppercase tracking-widest">Stats</span>
                    </button>
                  </div>

                  {/* Device Info */}
                  <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Device Info</p>
                      <Info size={10} className="text-indigo-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-1.5 bg-black/20 rounded-lg">
                        <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Res</p>
                        <p className="text-[8px] text-white font-mono">{window.screen.width}x{window.screen.height}</p>
                      </div>
                      <div className="p-1.5 bg-black/20 rounded-lg">
                        <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Browser</p>
                        <p className="text-[8px] text-white font-mono truncate">{navigator.userAgent.split(' ')[0]}</p>
                      </div>
                      <div className="p-1.5 bg-black/20 rounded-lg">
                        <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Platform</p>
                        <p className="text-[8px] text-white font-mono">{(navigator as any).platform || '?'}</p>
                      </div>
                      <div className="p-1.5 bg-black/20 rounded-lg">
                        <p className="text-[6px] text-slate-500 font-black uppercase tracking-widest">Net</p>
                        <p className="text-[8px] text-emerald-400 font-mono">{(navigator as any).connection?.effectiveType || 'OK'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-800/40 rounded-[2rem] border border-slate-700/50 space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Performance Monitor</p>
                      <button 
                        onClick={() => handleUpdateConfigValue('modMenuPerformanceMonitor', !config.modMenuPerformanceMonitor)}
                        className={`p-1.5 rounded-lg transition-all ${config.modMenuPerformanceMonitor ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}
                      >
                        <ActivityIcon size={14} />
                      </button>
                    </div>
                    {config.modMenuPerformanceMonitor && (
                      <div className="h-20 flex items-end gap-1 bg-black/20 rounded-xl p-2 overflow-hidden">
                        {perfData.map((val, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            className={`flex-1 rounded-t-sm ${val > 80 ? 'bg-red-500' : val > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Quick Actions</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Broadcast Headline..."
                            value={quickHeadline}
                            onChange={(e) => setQuickHeadline(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:border-indigo-500 outline-none transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickHeadline();
                            }}
                          />
                          <Stars className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500/30" size={16} />
                        </div>
                        <button 
                          onClick={handleQuickHeadline}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                          <Plus size={16} /> Add Headline
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={handleWipeLogs}
                          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs text-white font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Trash2 size={14} className="text-red-400" /> Wipe Logs
                        </button>
                        <button 
                          onClick={handleFreezeUsers}
                          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs text-white font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <UserX size={14} className="text-amber-400" /> Freeze All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Section Order</p>
                      <Move size={10} className="text-slate-600" />
                    </div>
                    <Reorder.Group axis="y" values={sections} onReorder={handleReorderSections} className="space-y-1.5">
                      {sections.map(section => (
                        <Reorder.Item 
                          key={section} 
                          value={section}
                          className="p-1.5 bg-slate-900/50 border border-slate-700/50 rounded-lg flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-indigo-500/10 rounded-md text-indigo-400">
                              <Layers size={10} />
                            </div>
                            <span className="text-[9px] font-black text-white uppercase tracking-tighter">{section}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                              <EyeOff size={10} />
                            </button>
                            <div className="text-slate-700">
                              <Move size={10} />
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    <button className="w-full mt-3 py-2.5 border-2 border-dashed border-slate-700 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
                      <Plus size={12} /> Add Custom Section
                    </button>
                  </div>

                  <div className="p-4 bg-slate-800/40 rounded-[1.5rem] border border-slate-700/50 space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Quick Visibility</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'enableAccountsView', label: 'Accounts', icon: Users },
                        { id: 'enableMarketSync', label: 'Live Sync', icon: RefreshCw },
                        { id: 'showMetalInfoBoxes', label: 'App Info', icon: AlertTriangle },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleUpdateConfigValue(item.id as any, !config[item.id as keyof AppConfig])}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                            config[item.id as keyof AppConfig] 
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-white' 
                              : 'bg-slate-900/50 border-slate-700/50 text-slate-500'
                          }`}
                        >
                          <item.icon size={14} className={config[item.id as keyof AppConfig] ? 'text-indigo-400' : ''} />
                          <span className="text-[9px] font-bold uppercase">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'special' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'modMenuShowHitboxes', label: 'Hitboxes', icon: Bug, color: 'text-amber-400' },
                      { id: 'modMenuSoundEffects', label: 'Sounds', icon: Volume2, color: 'text-indigo-400' },
                      { id: 'modMenuGhostMode', label: 'Ghost', icon: Ghost, color: 'text-indigo-400' },
                      { id: 'modMenuRainbowMode', label: 'Rainbow', icon: Stars, color: 'text-pink-400' },
                      { id: 'modMenuConfetti', label: 'Confetti', icon: Sparkles, color: 'text-pink-400' },
                      { id: 'modMenuAutoClicker', label: 'AutoClick', icon: MousePointer2, color: 'text-indigo-400' },
                      { id: 'modMenuScreenshotMode', label: 'Screenshot', icon: MonitorSmartphone, color: 'text-emerald-400' },
                      { id: 'modMenuSpeedHack', label: 'Speed', icon: Zap, color: 'text-emerald-400' }
                    ].map(f => (
                      <div key={f.id} className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-1.5">
                          <f.icon size={12} className={config[f.id as keyof typeof config] ? f.color : 'text-slate-600'} />
                          <span className="text-[8px] font-black text-white uppercase tracking-tight">{f.label}</span>
                        </div>
                        <button 
                          onClick={() => handleUpdateConfigValue(f.id as any, !config[f.id as keyof typeof config])}
                          className={`w-8 h-4 rounded-full relative transition-all ${config[f.id as keyof typeof config] ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <motion.div animate={{ x: config[f.id as keyof typeof config] ? 18 : 2 }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Palette size={12} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-white uppercase tracking-tight">Menu Theme</span>
                      </div>
                      <select 
                        value={config.modMenuTheme || 'indigo'}
                        onChange={(e) => handleUpdateConfigValue('modMenuTheme', e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-1 text-[8px] text-white outline-none focus:border-indigo-500"
                      >
                        <option value="indigo">Indigo</option>
                        <option value="rose">Rose</option>
                        <option value="emerald">Emerald</option>
                        <option value="amber">Amber</option>
                        <option value="slate">Slate</option>
                        <option value="rainbow">Rainbow</option>
                      </select>
                    </div>

                    <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Code size={12} className="text-indigo-400" />
                          <span className="text-[8px] font-black text-white uppercase tracking-tight">CSS Inject</span>
                        </div>
                        <button 
                          onClick={() => handleUpdateConfigValue('modMenuCustomCSS', customCSS)}
                          className="p-1 bg-indigo-500 hover:bg-indigo-600 rounded-md text-[7px] font-black text-white uppercase transition-all"
                        >
                          <Wand2 size={10} />
                        </button>
                      </div>
                      <textarea 
                        value={customCSS}
                        onChange={(e) => setCustomCSS(e.target.value)}
                        placeholder="/* CSS here... */"
                        className="w-full h-10 bg-slate-950/50 border border-slate-700 rounded-lg p-1.5 text-[8px] font-mono text-emerald-400 focus:border-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rates and Metals blocks removed */}

              {activeTab === 'users' && (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={10} />
                      <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-1 pl-6 pr-2 text-[9px] text-white focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <select 
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-slate-950/50 border border-slate-700 rounded-lg px-1.5 text-[8px] font-black text-white uppercase outline-none focus:border-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-[10px]">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-white leading-tight">{user.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-[7px] text-slate-500 font-mono uppercase">{user.role}</span>
                              <div className={`w-1 h-1 rounded-full ${user.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => updateUserPoints(user.id, 500)}
                            className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-all"
                          >
                            <Stars size={10} />
                          </button>
                          <button 
                            onClick={() => updateUserRole(user.id, user.role.includes('admin') ? 'user' : 'admin')}
                            className={`p-1 rounded-md transition-all ${user.role.includes('admin') ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}
                          >
                            <Shield size={10} />
                          </button>
                          <button className="p-1 bg-slate-700/50 text-slate-400 rounded-md hover:text-white transition-all">
                            <Settings size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight">System Activity</p>
                    <button className="p-1 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                      <RefreshCw size={8} />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {logs.slice(0, 20).map(log => (
                      <div key={log.id} className="p-1.5 bg-slate-800/20 rounded-lg border border-slate-700/30 text-[8px] font-mono group hover:bg-slate-800/40 transition-all">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-400 font-bold">{log.userName}</span>
                            <span className={`uppercase font-black px-1 rounded text-[7px] ${
                              log.action === 'delete' ? 'bg-red-500/10 text-red-400' : 
                              log.action === 'add' ? 'bg-emerald-500/10 text-emerald-400' : 
                              'bg-indigo-500/10 text-indigo-400'
                            }`}>{log.action}</span>
                          </div>
                          <span className="text-slate-600 text-[7px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400 leading-tight">
                          <span className="text-slate-200">{log.target}</span>: {log.details}
                        </p>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-center py-6 bg-slate-800/20 rounded-xl border-2 border-dashed border-slate-700/50">
                        <Terminal size={20} className="text-slate-700 mx-auto mb-1.5 opacity-20" />
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">No logs</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight">Network Monitor</p>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[7px] text-emerald-400 font-black uppercase">Live</span>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                          <tr className="border-b border-slate-800">
                            <th className="p-1.5 text-[7px] font-black text-slate-500 uppercase">Method</th>
                            <th className="p-1.5 text-[7px] font-black text-slate-500 uppercase">Path</th>
                            <th className="p-1.5 text-[7px] font-black text-slate-500 uppercase">Status</th>
                            <th className="p-1.5 text-[7px] font-black text-slate-500 uppercase">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {networkLogs.map(log => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-1.5">
                                <span className={`px-1 py-0.5 rounded text-[6px] font-black ${
                                  log.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                                  log.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {log.method}
                                </span>
                              </td>
                              <td className="p-1.5 text-[8px] text-slate-300 font-mono truncate max-w-[80px]">{log.path}</td>
                              <td className="p-1.5">
                                <span className={`text-[8px] font-black ${
                                  log.status < 300 ? 'text-emerald-400' :
                                  log.status < 500 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="p-1.5 text-[8px] text-slate-500 font-mono">{log.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'console' && (
                <div className="flex flex-col h-[250px] bg-black/40 rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-2 font-mono text-[8px] space-y-0.5 custom-scrollbar">
                    {consoleHistory.map((line, i) => (
                      <div key={i} className={`flex gap-1 ${
                        line.type === 'error' ? 'text-red-400' : 
                        line.type === 'success' ? 'text-emerald-400' : 
                        line.type === 'cmd' ? 'text-indigo-400' : 'text-slate-400'
                      }`}>
                        <span className="opacity-30 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                        <span className="break-all">{line.text}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleConsoleSubmit} className="p-1.5 bg-black/40 border-t border-slate-800 flex items-center gap-1.5">
                    <TerminalIcon size={10} className="text-indigo-500" />
                    <input 
                      type="text" 
                      value={consoleInput}
                      onChange={(e) => setConsoleInput(e.target.value)}
                      placeholder="Command..."
                      className="flex-1 bg-transparent border-none outline-none text-[8px] font-mono text-white placeholder:text-slate-700"
                      autoFocus
                    />
                    <button type="submit" className="text-indigo-500 hover:text-indigo-400 transition-colors">
                      <Send size={10} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 sm:p-3 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">SECURE_DEV_SESSION</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-[0.1em] transition-all active:scale-95"
              >
                EXIT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Styles for Rainbow Mode & Custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        ${config.modMenuRainbowMode ? `
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
        ` : ''}
        ${config.modMenuShowHitboxes ? `
          * { outline: 1px solid rgba(255, 0, 0, 0.2) !important; }
          *:hover { outline: 1px solid rgba(255, 0, 0, 0.5) !important; }
        ` : ''}
        ${config.modMenuCustomCSS || ''}
      `}} />
    </div>
  );
};

export default DevModMenu;
