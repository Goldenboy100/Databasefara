import React, { useState } from 'react';
import { Users, Plus, Search, Phone, DollarSign } from 'lucide-react';
import { AccountingClient } from '../../types.ts';

interface ClientsViewProps {
  clients: AccountingClient[];
  onAddClient: (client: AccountingClient) => void;
  t: (key: string) => string;
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [debtUSD, setDebtUSD] = useState('');
  const [debtIQD, setDebtIQD] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newClient: AccountingClient = {
      id: Date.now().toString(),
      name,
      phone,
      debtUSD: parseFloat(debtUSD) || 0,
      debtIQD: parseFloat(debtIQD) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddClient(newClient);
    
    // Reset form
    setName('');
    setPhone('');
    setDebtUSD('');
    setDebtIQD('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Users className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Client Management</h2>
            <p className="text-xs text-slate-500">Track client debts and balances</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add New Client'}
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Client Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="+964..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Initial Debt (USD)</label>
              <input
                type="number"
                value={debtUSD}
                onChange={(e) => setDebtUSD(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Initial Debt (IQD)</label>
              <input
                type="number"
                value={debtIQD}
                onChange={(e) => setDebtIQD(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm transition-transform hover:scale-105"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clients by name or phone..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No clients found.
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{client.name}</h3>
                  {client.phone && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Phone size={12} />
                      {client.phone}
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-500 uppercase">Debt USD</span>
                  <span className={`text-sm font-black ${client.debtUSD > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ${client.debtUSD.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-500 uppercase">Debt IQD</span>
                  <span className={`text-sm font-black ${client.debtIQD > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    IQD {client.debtIQD.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientsView;
