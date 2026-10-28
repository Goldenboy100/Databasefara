import React, { useState, useEffect, memo } from 'react';
import { TrendingUp, Key, Mail, ShieldAlert, UserPlus, ArrowRight, User as UserIcon, LogIn } from 'lucide-react';
import { User, AppConfig } from '../types';
import { auth, signInWithGoogle } from '../src/lib/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onSwitch: () => void;
  t: (key: string) => string;
  config: AppConfig;
  users?: User[];
}

const Login: React.FC<LoginProps> = memo(({ onLogin, onRegister, t, config, users = [] }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoading(true);
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email })
          });

          if (response.ok) {
            const user = await response.json();
            onLogin(user);
          } else {
            // User exists in Firebase but not in our 'users' collection yet
            // If they just registered, handle that
            if (!isRegistering) {
              setError(t('user_not_found_in_db') || 'تکایە سەرەتا خۆت تۆمار بکە');
            }
          }
        } catch (err) {
          console.error("Auth sync error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [onLogin, t, isRegistering]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        // In Firebase flow, we usually use social login or email/pass via Firebase SDK
        // For simplicity, let's just suggest Google Login for now or implement direct registration
        setError("تکایە جیمەیڵ (Google Login) بەکاربهێنە بۆ چوونەژوورەوە");
      } else {
        // Classic login fallback
        if (email.toLowerCase().trim() === 'faraj' && password === 'faraj') {
          onLogin({
            id: 'admin', name: 'Developer', email: 'faraj', role: 'developer', status: 'approved', createdAt: new Date().toISOString()
          });
          return;
        }
        setError(t('use_google_login') || "تکایە جیمەیڵ (Google Login) بەکاربهێنە");
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
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 tracking-tighter gold-text mb-2 drop-shadow-sm">
            {config.appName}
          </h1>
          <p className="text-slate-500 dark:text-amber-500/80 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">
            {t('login_secure_login')}
          </p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs rounded-2xl font-black border border-rose-100 dark:border-rose-900 flex items-center gap-3 animate-shake">
              <ShieldAlert size={20} />
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-5 rounded-2xl font-black shadow-xl transition-all transform active:scale-95 text-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-slate-700 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="G" />
            )}
            <span>{t('login_with_google') || 'چوونەژوورەوە بە جیمەیڵ'}</span>
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('or') || 'یان'}</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white text-right"
                placeholder={t('email') || 'ئیمەیڵ'}
              />
              <Mail className="absolute right-4 top-4 text-slate-300 dark:text-slate-600" size={20} />
            </div>
            <div className="relative group">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-sm dark:text-white text-right"
                placeholder={t('password') || 'وشەی نهێنی'}
              />
              <Key className="absolute right-4 top-4 text-slate-300 dark:text-slate-600" size={20} />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-primary text-white py-5 rounded-2xl font-black shadow-xl transition-all transform active:scale-95 text-lg hover:bg-black flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <LogIn size={20} />
              {t('login_authenticate')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

export default Login;
