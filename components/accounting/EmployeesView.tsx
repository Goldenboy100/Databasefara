import React, { useState } from 'react';
import { UserPlus, Trash2, Key, ShieldCheck, UserCheck, Activity, DollarSign } from 'lucide-react';
import { Employee, AccountingTransaction } from '../../types.ts';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
  transactions?: AccountingTransaction[];
  t: (key: string) => string;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({ 
  employees, 
  onAddEmployee, 
  onDeleteEmployee, 
  transactions = [], 
  t 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    
    onAddEmployee({
      id: 'emp_' + Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || '123456',
      role,
      createdAt: new Date().toISOString(),
    });

    setName('');
    setEmail('');
    setPassword('123456');
    setRole('employee');
  };

  const getEmployeeStats = (empId: string, empName: string) => {
    const empTxs = transactions.filter(tx => 
      tx.employeeId === empId || 
      (tx.createdBy && tx.createdBy.toLowerCase() === empName.toLowerCase())
    );

    const count = empTxs.length;
    const usdVolume = empTxs
      .filter(tx => tx.currency === 'USD')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const iqdVolume = empTxs
      .filter(tx => tx.currency === 'IQD')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return { count, usdVolume, iqdVolume };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('employees') || 'بەڕێوەبردنی کارمەندان و دەسەڵاتەکان'}</h2>
        <p className="text-xs text-slate-500 font-bold">{t('employees_desc') || 'زیادکردنی کارمەند، دیاریکردنی وشەی نهێنی و پلە (کارمەند یان بەڕێوەبەر)، و بینینی قەبارەی کارەکانیان'}</p>
      </div>

      {/* Add Employee Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-xl">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-primary" />
          {t('add_new_employee') || 'زیادکردنی کارمەندی نوێ'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5">{t('name') || 'ناوی کارمەند'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ئارام ئەحمەد"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5">{t('email_or_user') || 'ئیمەیڵ / ناوی چوونەژوورەوە'}</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aram@golden.com"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5">{t('password') || 'وشەی نهێنی'}</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5">{t('role') || 'پلە و دەسەڵات'}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'employee' | 'admin')}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="employee">{t('role_employee') || 'کارمەند (ئاسایی)'}</option>
              <option value="admin">{t('role_admin') || 'بەڕێوەبەر (دەسەڵاتی تەواو)'}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
        >
          <UserPlus size={18} />
          {t('add_employee') || 'زیادکردنی کارمەند'}
        </button>
      </form>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-500" />
            {t('registered_employees') || 'لیستی کارمەندان و ئامارەکان'} ({employees.length})
          </h3>
        </div>

        {employees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            {t('no_employees_yet') || 'هێشتا هیچ کارمەندێک زیاد نەکراوە. کارمەند لە بەشی سەرەوە زیاد بکە.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-black text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">{t('name') || 'ناو'}</th>
                  <th className="px-6 py-4">{t('email_or_user') || 'ئیمەیڵ / ناوی بەکارهێنەر'}</th>
                  <th className="px-6 py-4">{t('password') || 'وشەی نهێنی'}</th>
                  <th className="px-6 py-4">{t('role') || 'پلە'}</th>
                  <th className="px-6 py-4">{t('activity') || 'چالاکی و مامەڵە'}</th>
                  <th className="px-6 py-4 text-center">{t('actions') || 'کردارەکان'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-bold">
                {employees.map(employee => {
                  const stats = getEmployeeStats(employee.id, employee.name);
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{employee.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
                          {employee.password || '123456'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          employee.role === 'admin' 
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {employee.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                          {employee.role === 'admin' ? (t('role_admin') || 'بەڕێوەبەر') : (t('role_employee') || 'کارمەند')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5">
                          <span className="text-slate-900 dark:text-white font-bold">{stats.count} مامەڵە</span>
                          {(stats.usdVolume > 0 || stats.iqdVolume > 0) && (
                            <div className="text-[10px] text-slate-500 font-medium flex gap-2">
                              {stats.usdVolume > 0 && <span className="text-emerald-500">${stats.usdVolume.toLocaleString()}</span>}
                              {stats.iqdVolume > 0 && <span className="text-sky-500">{stats.iqdVolume.toLocaleString()} د.ع</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => {
                            if (confirm(`دڵنیایت لە سڕینەوەی کارمەند ${employee.name}؟`)) {
                              onDeleteEmployee?.(employee.id);
                            }
                          }}
                          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                          title="سڕینەوە"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesView;
