
import React, { useState, useEffect, memo } from 'react';
import { TrendingUp, Key, Mail, ShieldAlert, UserPlus, ArrowRight, Crown, User as UserIcon } from 'lucide-react';
import { User } from '../types';

import { AppConfig } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onSwitch: () => void;
  t: (key: string) => string;
  config: AppConfig;
  users?: User[];
}

const Login: React.FC<LoginProps> = memo(({ onLogin, onRegister, t, config, users = [] }) => {
  console.log('Login component received t prop:', t); // Debugging line
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    console.log("isRegistering:", isRegistering);
  }, [isRegistering]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    console.log("Login component rendered");
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit triggered");
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        // Check if user already exists locally
        if (users.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim())) {
          setError(t('email_exists') || 'ئەم ئیمەیڵە پێشتر تۆمارکراوە!');
          setIsLoading(false);
          return;
        }

        try {
          const baseUrl = window.location.origin;
          const fullUrl = `${baseUrl}/api/register`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ 
              name: name.trim(), 
              email: email.trim(), 
              password,
              avatar: avatar || undefined
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setError(data.error || 'Registration failed');
            setIsLoading(false);
            return;
          }

          const newUser = await response.json();
          onLogin(newUser); // Log them in immediately
        } catch (err) {
          console.error("Registration error:", err);
          setError('Network error during registration');
          setIsLoading(false);
          return;
        }
      } else {
        // 1. Developer Backdoor (Always works)
        if (email.toLowerCase().trim() === 'faraj' && password === 'faraj') {
          onLogin({
            id: 'admin',
            name: 'Developer',
            email: 'faraj',
            password: 'faraj',
            role: 'developer',
            status: 'approved',
            createdAt: new Date().toISOString()
          });
          return;
        }

        // 2. Check local users (Offline Support)
        const localUser = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
        if (localUser) {
          if (localUser.status === 'blocked') {
            setError(t('account_blocked') || 'هەژمارەکەت ڕاگیراوە!');
          } else if (localUser.expiresAt && new Date(localUser.expiresAt) < new Date()) {
            setError(t('account_expired') || 'کاتەکەت تەواو بووە! تکایە پەیوەندی بە ئەدمینەوە بکە.');
          } else {
            onLogin(localUser);
          }
          return;
        }

        // 3. Try Server Login
        try {
          const baseUrl = window.location.origin;
          const fullUrl = `${baseUrl}/api/login`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ email: email.trim(), password }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const user = await response.json();
            console.log("Login successful, user:", user);
            if (user.status === 'blocked') {
              setError(t('account_blocked'));
            } else if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
              setError(t('account_expired'));
            } else {
              console.log("Calling onLogin...");
              onLogin(user);
            }
          } else {
            console.log("Login failed, response not ok");
            const err = await response.json();
            setError(err.error || t('invalid_credentials'));
          }
        } catch (err: any) {
          console.error("Login error:", err);
          // Fallback for developer account if server is down or network issue
          if (email.toLowerCase().trim() === 'faraj' && password === 'faraj') {
            onLogin({
              id: 'admin',
              name: 'Developer',
              email: 'faraj',
              password: 'faraj',
              role: 'developer',
              status: 'approved',
              createdAt: new Date().toISOString()
            });
          } else {
            if (err.name === 'AbortError') {
              setError(t('slow_connection'));
            } else {
              setError(t('no_server_connection'));
            }
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-text p-6 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -mr-80 -mt-80 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full -ml-80 -mb-80 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 animate-in zoom-in duration-700 relative">
            <img 
              src={config.customLogo || `/golden-logo.jpg?v=${config.logoVersion || '1'}`} 
              alt="Logo" 
              className="w-full h-full rounded-[2.5rem] object-cover shadow-[0_0_40px_rgba(245,158,11,0.4)] border-2 border-amber-500/20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer rounded-[2.5rem]" />
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 tracking-tighter gold-text mb-2 drop-shadow-sm">
            {t('login_title') || config.appName}
          </h1>
          <p className="text-slate-500 dark:text-amber-500/80 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
            {isRegistering ? t('login_join_network') : t('login_secure_login')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/50 dark:border-white/10 space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700 relative z-50">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs rounded-2xl font-black border border-rose-100 dark:border-rose-900 flex items-center gap-3 animate-shake">
              <ShieldAlert size={20} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-black border border-emerald-100 dark:border-emerald-900 flex items-center gap-3 animate-in zoom-in">
              <TrendingUp size={20} />
              {success}
            </div>
          )}
          
          {isRegistering && (
            <div className="space-y-3 animate-in slide-in-from-left-10 fade-in duration-300">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('login_name_label')}</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-card outline-none transition-all font-bold text-sm dark:text-white text-right disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('login_name_placeholder')}
                />
                <UserPlus className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400" />}
                </div>
                <label className="flex-1 cursor-pointer bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  {t('set_profile_picture')}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('email')}</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                disabled={isLoading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-card outline-none transition-all font-bold text-sm dark:text-white text-right disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('login_username_placeholder')}
                dir="ltr"
              />
              <Mail className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('password')}</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                disabled={isLoading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-card outline-none transition-all font-bold text-sm dark:text-white text-right disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('login_password_placeholder')}
                dir="ltr"
              />
              <Key className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl transition-all transform active:scale-95 text-lg hover:bg-black dark:hover:bg-slate-700 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('please_wait')}</span>
              </>
            ) : (
              <>
                {isRegistering ? t('login_create_account') : t('login_authenticate')}
                {!isRegistering && <ArrowRight size={20} />}
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
              {isRegistering ? t('login_already_have_account') : t('login_no_account_yet')}
            </p>
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                isRegistering 
                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10'
              }`}
            >
              {isRegistering ? t('login_authenticate') : t('login_create_account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Login;
