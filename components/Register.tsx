
import React, { useState } from 'react';
import { TrendingUp, User as UserIcon, Mail, Key, Phone, Globe, MapPin } from 'lucide-react';
import { User } from '../types';

interface RegisterProps {
  users: User[];
  onRegister: (newUser: User) => void;
  onSwitch: () => void;
  t: (key: string) => string;
}

const Register: React.FC<RegisterProps> = ({ users, onRegister, onSwitch, t }) => {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, businessName, email, password, phone, country, city, address })
      });
      
      if (response.ok) {
        alert("هەژمارەکەت بە سەرکەوتوویی دروستکرا و چالاک کرا! ئێستا دەتوانیت بچیتە ژوورەوە.");
        onSwitch();
      } else {
        alert("هەڵەیەک لە تۆمارکردن ڕوویدا");
      }
    } catch (err) {
      alert("کێشەی پەیوەندی لەگەڵ سێرڤەر");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 text-white rounded-[2rem] mb-6 shadow-xl font-black italic tracking-tighter text-3xl">
            GE
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tight">{t('register')}</h1>
          <p className="text-slate-500 dark:text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">{t('app_name')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('fullname')}</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="..."
              />
              <UserIcon className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">ناوی کۆمپانیا یان مارکێت</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="..."
              />
              <TrendingUp className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('email')}</label>
            <div className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="..."
              />
              <Mail className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">{t('password')}</label>
            <div className="relative group">
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="••••••••"
              />
              <Key className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">ژمارەی مۆبایل</label>
            <div className="relative group">
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="07XX XXX XXXX"
              />
              <Phone className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">وڵات</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                  placeholder="..."
                />
                <Globe className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">شار</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                  placeholder="..."
                />
                <MapPin className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 block mr-2 uppercase tracking-widest">ناونیشان (Address)</label>
            <div className="relative group">
              <input 
                type="text" 
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm dark:text-white"
                placeholder="..."
              />
              <MapPin className="absolute right-4 top-4 text-slate-300 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 dark:bg-emerald-600 text-emerald-500 dark:text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-900/20 transition-all transform active:scale-95"
          >
            {t('register')}
          </button>

          <p className="text-center text-slate-400 dark:text-slate-500 text-xs font-bold pt-4">
            {t('have_account')} {' '}
            <button type="button" onClick={onSwitch} className="text-emerald-600 font-black hover:underline underline-offset-4">{t('login')}</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
