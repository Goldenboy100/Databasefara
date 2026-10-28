
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Package, Calendar, FileText, ChevronRight, Image as ImageIcon, Upload, X, LayoutGrid, List, ShoppingCart, Tag, Search, Filter, Printer, CheckCircle, Clock, User as UserIcon, CalendarClock, Edit3, Check, Home, RefreshCw } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Transaction, User, AppConfig, Product, Category } from '../types.ts';
import { hasRole } from '../utils.ts';

interface TransactionItemProps {
  tx: Transaction;
  t: (key: string) => string;
  onMarkAsPaid: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionItem = React.memo(({ tx, t, onMarkAsPaid, onEdit, onDelete }: TransactionItemProps) => {
  return (
    <div className="p-6 hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {tx.image ? (
              <img src={tx.image} alt={tx.itemName} className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/20" referrerPolicy="no-referrer" />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${tx.type === 'buy' ? 'bg-emerald-500/20 text-emerald-500' : (tx.type === 'expense' ? 'bg-red-500/20 text-red-500' : (tx.type === 'rent' ? 'bg-orange-500/20 text-orange-500' : 'bg-rose-500/20 text-rose-500'))}`}>
                {tx.type === 'expense' ? <DollarSign size={24} /> : (tx.type === 'rent' ? <Home size={24} /> : <Package size={24} />)}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white ${tx.type === 'buy' ? 'bg-emerald-500' : (tx.type === 'expense' ? 'bg-red-500' : (tx.type === 'rent' ? 'bg-orange-500' : 'bg-rose-500'))}`}>
              {tx.type === 'buy' ? <TrendingUp size={10} /> : (tx.type === 'expense' ? <DollarSign size={10} /> : (tx.type === 'rent' ? <Home size={10} /> : <TrendingDown size={10} />))}
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-lg font-black text-slate-900 dark:text-white truncate gold-text">{tx.itemName}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : (tx.type === 'expense' ? 'bg-red-500/10 text-red-500' : (tx.type === 'rent' ? 'bg-orange-500/10 text-orange-500' : 'bg-rose-500/10 text-rose-500'))}`}>
                {tx.type === 'buy' ? t('buy') : (tx.type === 'expense' ? t('expense') : (tx.type === 'rent' ? t('rent') : t('sell')))}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Calendar size={12} />
                {new Date(tx.date).toLocaleDateString('ku-IQ')}
              </div>
              {tx.status === 'pending' && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-500/10 text-amber-500 flex items-center gap-1">
                  <Clock size={10} />
                  {t('debt')}
                </span>
              )}
            </div>
            {tx.customerName && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                <UserIcon size={12} />
                {tx.customerName}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-xl font-black tabular-nums ${tx.type === 'buy' ? 'text-rose-500' : (tx.type === 'expense' || tx.type === 'rent' ? 'text-red-500' : 'text-emerald-500')}`}>
            {tx.type === 'buy' || tx.type === 'expense' || tx.type === 'rent' ? '-' : '+'}{(tx.total || 0).toLocaleString()} IQD
          </p>
          {tx.profit !== undefined && tx.type !== 'expense' && tx.type !== 'rent' && (
            <p className={`text-[10px] font-black mt-1 ${tx.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {t('profit')}: {tx.profit >= 0 ? '+' : ''}{(tx.profit || 0).toLocaleString()} IQD
            </p>
          )}
          {tx.type !== 'expense' && tx.type !== 'rent' && (
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              {(tx.amount || 0).toLocaleString()} × {(tx.price || 0).toLocaleString()} IQD
            </p>
          )}
          <div className="flex items-center justify-end gap-2 mt-2">
            {tx.status === 'pending' && (
              <button 
                onClick={() => onMarkAsPaid(tx)}
                className="text-[10px] font-black text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all print:hidden"
              >
                {t('mark_as_paid')}
              </button>
            )}
            <button 
              onClick={() => onEdit(tx)}
              className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => onDelete(tx.id)}
              className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      {tx.note && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[11px] font-bold text-slate-500 italic flex items-start gap-2">
          <FileText size={14} className="shrink-0 mt-0.5" />
          {tx.note}
        </div>
      )}
    </div>
  );
});

interface ProductCardProps {
  product: Product;
  t: (key: string) => string;
  onSelect: (id: string) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard = React.memo(({ product, t, onSelect, onEdit, onDelete }: ProductCardProps) => {
  return (
    <div 
      onClick={() => onSelect(product.id)}
      className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl overflow-hidden group hover:shadow-2xl transition-all cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
            <Package size={48} />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="p-2 bg-amber-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
            className="p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {product.quantity !== undefined && (
          <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg ${product.quantity <= 5 ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white'}`}>
            {t('stock')}: {product.quantity}
          </div>
        )}
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-black text-slate-900 dark:text-white truncate flex-1">{product.name}</h4>
          {product.category && (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter">
              {product.category}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-black text-primary">{(product.defaultPrice || 0).toLocaleString()} <span className="text-[10px]">{t('iqd')}</span></div>
          {product.barcode && (
            <div className="text-[9px] font-bold text-slate-400 font-mono">{product.barcode}</div>
          )}
        </div>
      </div>
    </div>
  );
});

interface AccountsViewProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  currentUser: User;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  t: (key: string) => string;
  onBack: () => void;
}

const AccountsView: React.FC<AccountsViewProps> = React.memo(({ 
  transactions, 
  onAddTransaction, 
  onUpdateTransaction,
  onDeleteTransaction, 
  products,
  onUpdateProducts,
  categories,
  onUpdateCategories,
  currentUser, 
  config,
  onUpdateConfig,
  t,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'inventory' | 'pos'>('transactions');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'expense' | 'rent' | 'debt'>('all');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(config.ledgerTitle || 'کۆمپانیا و مارکێت');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // POS State
  const [cart, setCart] = useState<{product: Product, quantity: number, price: number}[]>([]);
  const [cartCustomer, setCartCustomer] = useState('');
  const [cartStatus, setCartStatus] = useState<'paid' | 'pending'>('paid');
  const [cartDueDate, setCartDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImgRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    itemName: '',
    type: 'buy' as 'buy' | 'sell' | 'expense' | 'rent',
    amount: '',
    price: '',
    profit: '',
    image: '',
    note: '',
    customerName: '',
    status: 'paid' as 'paid' | 'pending',
    dueDate: ''
  });

  const [productData, setProductData] = useState({
    name: '',
    defaultPrice: '' as string | number,
    costPrice: '' as string | number,
    quantity: '' as string | number,
    barcode: '',
    wholesalePrice: '' as string | number,
    expiryDate: '',
    socialLink: '',
    note: '',
    image: '',
    category: ''
  });
  const [productFormTab, setProductFormTab] = useState<'basic' | 'advanced'>('basic');

  const generateBarcode = (categoryName: string) => {
    // Find category object if possible, or use name
    const category = categories.find(c => c.name === categoryName);
    let prefix = '99';
    
    if (categoryName === 'Food') prefix = '20';
    else if (categoryName === 'Electronics') prefix = '30';
    else if (categoryName === 'General') prefix = '10';
    else if (category) {
      // Generate hash from ID or Name
      const source = category.id || category.name;
      const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      prefix = (hash % 89 + 10).toString();
    } else if (categoryName) {
       const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
       prefix = (hash % 89 + 10).toString();
    }
    
    const categoryProducts = products.filter(p => p.category === categoryName);
    const nextNum = categoryProducts.length + 1;
    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    if (editingCategoryId) {
      // Update existing category
      const updatedCategories = categories.map(c => 
        c.id === editingCategoryId ? { ...c, name: newCategoryName.trim() } : c
      );
      onUpdateCategories(updatedCategories);
      setEditingCategoryId(null);
    } else {
      // Add new category
      if (categories.some(c => c.name === newCategoryName.trim())) return;

      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCategoryName.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      onUpdateCategories([...categories, newCategory]);
    }
    setNewCategoryName('');
  };

  const handleEditCategory = (category: Category) => {
    setNewCategoryName(category.name);
    setEditingCategoryId(category.id);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm(t('confirm_delete_category'))) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  const userTransactions = useMemo(() => 
    transactions
      .filter(t => t.userId === currentUser.id)
      .filter(t => {
        const itemName = t.itemName || '';
        const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'all' 
          ? true 
          : filterType === 'debt' 
            ? t.status === 'pending'
            : t.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, currentUser.id, searchTerm, filterType]
  );

  const userProducts = useMemo(() => 
    products.filter(p => p.userId === currentUser.id),
    [products, currentUser.id]
  );

  const stats = useMemo(() => {
    let totalBuy = 0;
    let totalSell = 0;
    let totalExpense = 0;
    let totalRent = 0;
    let manualProfitTotal = 0;
    
    userTransactions.forEach(t => {
      if (t.type === 'buy') totalBuy += t.total;
      else if (t.type === 'sell') totalSell += t.total;
      else if (t.type === 'expense') totalExpense += t.total;
      else if (t.type === 'rent') totalRent += t.total;
      
      if (t.profit !== undefined) {
        manualProfitTotal += t.profit;
      }
    });

    return {
      totalBuy,
      totalSell,
      totalExpense,
      totalRent,
      totalSpending: totalBuy + totalExpense + totalRent,
      profit: manualProfitTotal !== 0 ? manualProfitTotal : (totalSell - totalBuy - totalExpense - totalRent)
    };
  }, [userTransactions]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const selectedProductStats = useMemo(() => {
    if (!selectedProduct) return null;
    const productTransactions = userTransactions.filter(t => t.itemName === selectedProduct.name);
    
    let totalBuy = 0;
    let totalSell = 0;
    
    productTransactions.forEach(t => {
      if (t.type === 'buy') totalBuy += t.total;
      if (t.type === 'sell') totalSell += t.total;
    });

    return {
      totalBuy,
      totalSell,
      profit: totalSell - totalBuy,
      transactions: productTransactions
    };
  }, [selectedProduct, userTransactions]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'transaction' | 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'transaction') {
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setProductData(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || !formData.amount || !formData.price) return;

    const amount = parseFloat(formData.amount);
    const price = parseFloat(formData.price);
    const profit = formData.profit ? parseFloat(formData.profit) : undefined;
    
    const transactionData: Transaction = {
      id: editingTransaction ? editingTransaction.id : Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      itemName: formData.itemName,
      type: formData.type,
      amount,
      price,
      total: amount * price,
      profit,
      image: formData.image,
      date: editingTransaction ? editingTransaction.date : new Date().toISOString(),
      note: formData.note,
      customerName: formData.customerName,
      status: formData.status,
      dueDate: formData.dueDate
    };

    if (editingTransaction) {
      onUpdateTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
    }

    setFormData({ itemName: '', type: 'buy', amount: '', price: '', profit: '', image: '', note: '', customerName: '', status: 'paid', dueDate: '' });
    setShowAddForm(false);
    setEditingTransaction(null);
  };

  const handleAddProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productData.name || !productData.defaultPrice) return;

    if (editingProductId) {
      const updatedProducts = products.map(p => 
        p.id === editingProductId 
          ? { 
              ...p, 
              name: productData.name, 
              defaultPrice: parseFloat(String(productData.defaultPrice)),
              costPrice: productData.costPrice ? parseFloat(String(productData.costPrice)) : undefined,
              quantity: productData.quantity ? parseFloat(String(productData.quantity)) : undefined,
              barcode: productData.barcode,
              wholesalePrice: productData.wholesalePrice ? parseFloat(String(productData.wholesalePrice)) : undefined,
              expiryDate: productData.expiryDate,
              socialLink: productData.socialLink,
              note: productData.note,
              image: productData.image,
              category: productData.category
            } 
          : p
      );
      onUpdateProducts(updatedProducts);
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        name: productData.name,
        defaultPrice: parseFloat(String(productData.defaultPrice)),
        costPrice: productData.costPrice ? parseFloat(String(productData.costPrice)) : undefined,
        quantity: productData.quantity ? parseFloat(String(productData.quantity)) : undefined,
        barcode: productData.barcode,
        wholesalePrice: productData.wholesalePrice ? parseFloat(String(productData.wholesalePrice)) : undefined,
        expiryDate: productData.expiryDate,
        socialLink: productData.socialLink,
        note: productData.note,
        image: productData.image,
        category: productData.category
      };
      onUpdateProducts([...products, newProduct]);
    }
    
    setShowProductForm(false);
    setProductData({
      name: '',
      defaultPrice: '',
      costPrice: '',
      quantity: '',
      barcode: '',
      wholesalePrice: '',
      expiryDate: '',
      socialLink: '',
      note: '',
      image: '',
      category: ''
    });
    setEditingProductId(null);
    setProductFormTab('basic');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductData({
      name: product.name || '',
      defaultPrice: product.defaultPrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      quantity: product.quantity?.toString() || '',
      barcode: product.barcode || '',
      wholesalePrice: product.wholesalePrice?.toString() || '',
      expiryDate: product.expiryDate || '',
      socialLink: product.socialLink || '',
      note: product.note || '',
      image: product.image || '',
      category: product.category || ''
    });
    setShowProductForm(true);
  };

  // POS Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, price: product.defaultPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const date = new Date().toISOString();
    
    cart.forEach(item => {
      const t: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: 'sell',
        itemName: item.product.name,
        amount: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        image: item.product.image,
        date: date,
        customerName: cartCustomer,
        status: cartStatus,
        dueDate: cartStatus === 'pending' ? cartDueDate : undefined,
        note: 'POS Sale'
      };
      onAddTransaction(t);
    });

    setCart([]);
    setCartCustomer('');
    setCartStatus('paid');
    setCartDueDate('');
    setActiveTab('transactions');
  };

  const handleQuickAction = (product: Product, type: 'buy' | 'sell') => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      itemName: product.name,
      type,
      amount: 1,
      price: product.defaultPrice,
      total: product.defaultPrice,
      image: product.image,
      date: new Date().toISOString(),
      note: `Quick ${type} from inventory`
    };
    onAddTransaction(newTransaction);
  };

  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
  };

  const handleMarkAsPaid = useCallback((t: Transaction) => {
    if (window.confirm('دڵنیای کە ئەم قەرزە وەرگیراوە؟')) {
      onUpdateTransaction({ ...t, status: 'paid' });
    }
  }, [onUpdateTransaction]);

  const handleEditTransaction = useCallback((t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
      type: t.type,
      itemName: t.itemName,
      amount: t.amount.toString(),
      price: t.price.toString(),
      customerName: t.customerName || '',
      status: t.status || 'paid',
      dueDate: t.dueDate || '',
      note: t.note || '',
      image: t.image || '',
      profit: t.profit?.toString() || ''
    });
    setShowAddForm(true);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (window.confirm(t('confirm_delete_transaction'))) {
      onDeleteTransaction(id);
    }
  }, [onDeleteTransaction, t]);

  const handleEditProductCallback = useCallback((product: Product) => {
    handleEditProduct(product);
  }, []);

  const handleDeleteProductCallback = useCallback((id: string) => {
    if (window.confirm(t('confirm_delete_product'))) {
      handleDeleteProduct(id);
    }
  }, [handleDeleteProduct, t]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTitle = () => {
    onUpdateConfig({ ...config, ledgerTitle: titleInput });
    setIsEditingTitle(false);
  };

  const canEditTitle = hasRole(currentUser, ['admin', 'developer', 'VIP', 'VIP+']);

  if (selectedProduct && selectedProductStats) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-32">
        <div className="flex items-center gap-4 px-2">
          <button 
            onClick={() => setSelectedProductId(null)}
            className="p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5 shadow-lg text-slate-500 hover:text-primary transition-all"
          >
            <ChevronRight size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{selectedProduct.name}</h1>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg shrink-0">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('current_price')}</div>
              <div className="text-3xl font-black text-primary">{(selectedProduct.defaultPrice || 0).toLocaleString()} {t('iqd')}</div>
              {selectedProduct.category && (
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                  {selectedProduct.category}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEditProduct(selectedProduct)}
                className="p-3 bg-amber-500 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                <Edit3 size={20} />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(t('confirm_delete_product'))) {
                    handleDeleteProduct(selectedProduct.id);
                    setSelectedProductId(null);
                  }
                }}
                className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><TrendingDown size={20} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest crafted-label">{t('total_spending_buy')}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums crafted-title">{(selectedProductStats.totalBuy || 0).toLocaleString()} {t('iqd')}</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><TrendingUp size={20} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest crafted-label">{t('total_income_sell')}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums crafted-title">{(selectedProductStats.totalSell || 0).toLocaleString()} {t('iqd')}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-xl backdrop-blur-xl ${selectedProductStats.profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${selectedProductStats.profit >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}><DollarSign size={20} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest crafted-label">{t('profit')}</span>
            </div>
            <p className={`text-2xl font-black tabular-nums crafted-title ${selectedProductStats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {selectedProductStats.profit >= 0 ? '+' : ''}{(selectedProductStats.profit || 0).toLocaleString()} {t('iqd')}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handleQuickAction(selectedProduct, 'buy')}
            className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp size={24} />
            کڕینی {selectedProduct.name}
          </button>
          <button 
            onClick={() => handleQuickAction(selectedProduct, 'sell')}
            className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <TrendingDown size={24} />
            فرۆشتنی {selectedProduct.name}
          </button>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest italic crafted-title">{t('transaction_history')}</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {selectedProductStats.transactions.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <FileText size={48} className="mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">{t('no_transactions_found')}</p>
              </div>
            ) : (
              selectedProductStats.transactions.map(tx => (
                <div key={tx.id} className="p-6 hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${tx.type === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {tx.type === 'buy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">{tx.type === 'buy' ? t('buy') : t('sell')}</div>
                        <div className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('ku-IQ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${tx.type === 'buy' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {tx.type === 'buy' ? '-' : '+'}{(tx.total || 0).toLocaleString()} {t('iqd')}
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.amount} × {(tx.price || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-32 print:pb-0 print:max-w-none">
      {/* Back Button */}
      <div className="flex items-center justify-between px-2 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5 shadow-lg text-slate-500 hover:text-primary transition-all"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-black text-lg outline-none focus:border-primary"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase crafted-title">
                  {config.ledgerTitle || t('company_and_market')}
                </h1>
                {canEditTitle && (
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-primary transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            )}
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] crafted-label">{t('accounts')}</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="p-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5 shadow-lg text-slate-500 hover:text-primary transition-all"
        >
          <Printer size={20} />
        </button>
      </div>

      {/* Header & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                  <TrendingDown size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total_spending')}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{(stats.totalSpending || 0).toLocaleString()} {t('iqd')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total_income')}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{(stats.totalSell || 0).toLocaleString()} {t('iqd')}</p>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-xl backdrop-blur-xl ${stats.profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${stats.profit >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profit_loss')}</span>
          </div>
          <p className={`text-2xl font-black tabular-nums ${stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {stats.profit >= 0 ? '+' : ''}{(stats.profit || 0).toLocaleString()} {t('iqd')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[2rem] border border-white/10 mx-2 print:hidden">
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-white dark:bg-slate-800 text-primary shadow-xl' : 'text-slate-400'}`}
        >
          <List size={18} />
          {t('transactions')}
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white dark:bg-slate-800 text-primary shadow-xl' : 'text-slate-400'}`}
        >
          <LayoutGrid size={18} />
          {t('inventory')}
        </button>
        <button 
          onClick={() => setActiveTab('pos')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pos' ? 'bg-white dark:bg-slate-800 text-primary shadow-xl' : 'text-slate-400'}`}
        >
          <ShoppingCart size={18} />
          {t('pos')}
        </button>
      </div>

      {activeTab === 'transactions' && (
        <>
          {/* Search & Filter */}
          <div className="px-2 space-y-4 print:hidden">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_product')}
                className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 pl-12 rounded-[2rem] outline-none font-bold text-sm shadow-lg focus:shadow-xl transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {[
                { id: 'all', label: t('all_categories'), icon: List },
                { id: 'buy', label: t('buy'), icon: TrendingUp },
                { id: 'sell', label: t('sell'), icon: TrendingDown },
                { id: 'expense', label: t('expense'), icon: DollarSign },
                { id: 'rent', label: t('rent'), icon: Home },
                { id: 'debt', label: t('debt'), icon: Clock },

              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider whitespace-nowrap transition-all ${filterType === f.id ? 'bg-primary text-white shadow-lg' : 'bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:bg-white/60'}`}
                >
                  <f.icon size={14} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center px-2 print:hidden">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:scale-105 transition-transform"
            >
              {showAddForm ? t('close') : <><Plus size={18} /> {t('add_transaction')}</>}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('item_name')}</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.itemName}
                        onChange={e => setFormData({...formData, itemName: e.target.value})}
                        className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 pl-12 rounded-2xl outline-none font-bold text-sm shadow-inner"
                        placeholder={t('example_iphone_dollar_gold')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transaction_type')}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1 overflow-x-auto">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'buy'})}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'buy' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        {t('buy')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'sell'})}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'sell' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        {t('sell')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'expense'})}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        {t('expense')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'rent'})}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl font-black text-xs transition-all ${formData.type === 'rent' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        {t('rent')}
                      </button>
                    </div>
                  </div>

                  {formData.type === 'expense' || formData.type === 'rent' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('total')}</label>
                      <input 
                        type="number" 
                        step="any"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value, amount: '1'})}
                        className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-sm shadow-inner"
                        placeholder={`0 ${t('iqd')}`}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quantity')}</label>
                        <input 
                          type="number" 
                          step="any"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                          className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-sm shadow-inner"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('price_per_item')}</label>
                        <input 
                          type="number" 
                          step="any"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-sm shadow-inner"
                          placeholder={`0 ${t('iqd')}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('customer_name')}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={formData.customerName}
                        onChange={e => setFormData({...formData, customerName: e.target.value})}
                        className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 pl-12 rounded-2xl outline-none font-bold text-sm shadow-inner"
                        placeholder={t('customer_name_placeholder')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('status')}</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, status: 'paid'})}
                        className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.status === 'paid' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        <CheckCircle size={14} className="inline mr-1" />
                        {t('paid')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, status: 'pending'})}
                        className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.status === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500'}`}
                      >
                        <Clock size={14} className="inline mr-1" />
                        {t('debt')}
                      </button>
                    </div>
                  </div>

                  {formData.status === 'pending' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('due_date')}</label>
                      <div className="relative">
                        <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date" 
                          value={formData.dueDate}
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                          className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 pl-12 rounded-2xl outline-none font-bold text-sm shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('image_optional')}</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all overflow-hidden relative group"
                    >
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                            className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="text-slate-400 mb-2" size={24} />
                          <span className="text-[10px] font-black text-slate-500 uppercase">{t('image_optional')}</span>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'transaction')} accept="image/*" className="hidden" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profit')}</label>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.profit}
                      onChange={e => setFormData({...formData, profit: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-sm shadow-inner"
                      placeholder={t('optional_placeholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('note_optional')}</label>
                <textarea 
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border border-white/20 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-sm shadow-inner h-24 resize-none"
                  placeholder={t('more_info_placeholder')}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t('register')}
              </button>
            </form>
          )}

          {/* Transactions List */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mx-2">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest italic">{t('transaction_list')}</h3>
              <span className="text-[10px] font-bold text-slate-500 opacity-50">{userTransactions.length} Items</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 h-[600px]">
              {userTransactions.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest">{t('no_transactions')}</p>
                </div>
              ) : (
                <Virtuoso
                  style={{ height: '600px' }}
                  data={userTransactions}
                  itemContent={(index, tx) => (
                    <TransactionItem 
                      key={tx.id} 
                      tx={tx} 
                      t={t} 
                      onMarkAsPaid={handleMarkAsPaid} 
                      onEdit={handleEditTransaction} 
                      onDelete={handleDeleteTransaction} 
                    />
                  )}
                />
              )}
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Actions */}
          <div className="flex justify-end items-center px-2 gap-2">
            <button 
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <List size={18} />
              بەڕێوەبردنی بەشەکان
            </button>
            <button 
              onClick={() => {
                setEditingProductId(null);
                setProductData({
                  name: '',
                  defaultPrice: '',
                  costPrice: '',
                  quantity: '',
                  barcode: '',
                  wholesalePrice: '',
                  expiryDate: '',
                  socialLink: '',
                  note: '',
                  image: '',
                  category: ''
                });
                setShowProductForm(!showProductForm);
              }}
              className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:scale-105 transition-transform"
            >
              {showProductForm ? t('close') : <><Plus size={18} /> {t('add_new_product')}</>}
            </button>
          </div>

          {showCategoryManager && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
                  <h2 className="text-xl font-black">{t('manage_categories')}</h2>
                  <button 
                    onClick={() => setShowCategoryManager(false)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddCategory}
                      className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      {editingCategoryId ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                    <input 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder={editingCategoryId ? t('new_category_name') : t('new_category_name')}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                    />
                    {editingCategoryId && (
                      <button 
                        onClick={() => {
                          setEditingCategoryId(null);
                          setNewCategoryName('');
                        }}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <div className="text-center py-8 opacity-50">
                        <List size={32} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-black text-slate-400">{t('no_categories')}</p>
                      </div>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border transition-all ${editingCategoryId === cat.id ? 'border-primary ring-1 ring-primary/20' : 'border-slate-100 dark:border-slate-700'}`}>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleEditCategory(cat)}
                              className="text-amber-500 hover:bg-amber-500/10 p-2 rounded-xl transition-colors"
                            >
                              <Edit3 size={18} />
                            </button>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showProductForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
                  <h2 className="text-xl font-black">{editingProductId ? t('edit_product') : t('add_product')}</h2>
                  <button 
                    onClick={() => setShowProductForm(false)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setProductFormTab('basic')}
                    className={`flex-1 py-4 text-sm font-black transition-all relative ${productFormTab === 'basic' ? 'text-primary' : 'text-slate-400'}`}
                  >
                    {t('basic')}
                    {productFormTab === 'basic' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-8" />
                    )}
                  </button>
                  <button
                    onClick={() => setProductFormTab('advanced')}
                    className={`flex-1 py-4 text-sm font-black transition-all relative ${productFormTab === 'advanced' ? 'text-primary' : 'text-slate-400'}`}
                  >
                    {t('advanced')}
                    {productFormTab === 'advanced' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-8" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
                  {/* Image Upload - Always Visible */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center">
                        {productData.image ? (
                          <img src={productData.image} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={40} className="text-slate-300" />
                        )}
                      </div>
                      <button 
                        onClick={() => productImgRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Upload size={18} />
                      </button>
                      <input 
                        type="file" 
                        ref={productImgRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'product')}
                      />
                    </div>
                  </div>

                  {productFormTab === 'basic' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('product_barcode')} *</label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              const code = generateBarcode(productData.category || 'General');
                              setProductData({...productData, barcode: code});
                            }}
                            className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-500 hover:text-primary transition-colors"
                            title="Generate Barcode"
                          >
                            <RefreshCw size={20} />
                          </button>
                          <button className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-500 hover:text-primary transition-colors">
                            <List size={20} />
                          </button>
                          <input 
                            type="text" 
                            value={productData.barcode}
                            onChange={(e) => setProductData({...productData, barcode: e.target.value})}
                            placeholder={t('product_barcode')}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('product_name')} *</label>
                        <input 
                          type="text" 
                          value={productData.name}
                          onChange={(e) => setProductData({...productData, name: e.target.value})}
                          placeholder={t('product_name')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('category')} *</label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setShowCategoryManager(true)}
                            className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                          <select 
                            value={productData.category}
                            onChange={(e) => {
                              const newCategory = e.target.value;
                              let newBarcode = productData.barcode;
                              // Auto-generate barcode if adding new product, barcode is empty, and category is selected
                              if (!editingProductId && !newBarcode && newCategory) {
                                newBarcode = generateBarcode(newCategory);
                              }
                              setProductData({...productData, category: newCategory, barcode: newBarcode});
                            }}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20 appearance-none"
                            dir="rtl"
                          >
                            <option value="">{t('category')}</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('cost_price')} *</label>
                        <input 
                          type="number" 
                          value={productData.costPrice}
                          onChange={(e) => setProductData({...productData, costPrice: e.target.value})}
                          placeholder={t('cost_price')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('selling_price')} *</label>
                        <input 
                          type="number" 
                          value={productData.defaultPrice}
                          onChange={(e) => setProductData({...productData, defaultPrice: e.target.value})}
                          placeholder={t('selling_price')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('product_quantity')} *</label>
                        <input 
                          type="number" 
                          value={productData.quantity}
                          onChange={(e) => setProductData({...productData, quantity: e.target.value})}
                          placeholder={t('product_quantity')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('expiry_date')}</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="date" 
                            value={productData.expiryDate}
                            onChange={(e) => setProductData({...productData, expiryDate: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('wholesale_price')}</label>
                        <input 
                          type="number" 
                          value={productData.wholesalePrice}
                          onChange={(e) => setProductData({...productData, wholesalePrice: e.target.value})}
                          placeholder={t('wholesale_price')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('product_link')}</label>
                        <input 
                          type="text" 
                          value={productData.socialLink}
                          onChange={(e) => setProductData({...productData, socialLink: e.target.value})}
                          placeholder={t('product_link')}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block text-right">{t('product_note')}</label>
                        <textarea 
                          value={productData.note}
                          onChange={(e) => setProductData({...productData, note: e.target.value})}
                          placeholder={t('product_note')}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-right font-bold outline-none focus:ring-2 ring-primary/20 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => handleAddProduct()}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {editingProductId ? t('update_product') : t('add_product')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            {userProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-30">
                <Tag size={48} className="mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">{t('no_products')}</p>
              </div>
            ) : (
              userProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  t={t} 
                  onSelect={setSelectedProductId} 
                  onEdit={handleEditProductCallback} 
                  onDelete={handleDeleteProductCallback} 
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 h-[calc(100vh-200px)]">
          {/* Product Grid */}
          <div className="lg:col-span-2 flex flex-col h-full gap-4">
            {/* Search & Categories */}
            <div className="space-y-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search_product')}
                  className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 pl-12 rounded-[2rem] outline-none font-bold text-sm shadow-lg focus:shadow-xl transition-all"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:bg-white/60'}`}
                >
                  هەمووی
                </button>
                {Array.from(new Set([
                  ...categories.map(c => c.name),
                  ...userProducts.map(p => p.category).filter(Boolean)
                ])).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat!)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/40 dark:bg-slate-900/40 text-slate-500 hover:bg-white/60'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {userProducts
                  .filter(p => 
                    (selectedCategory === 'all' || p.category === selectedCategory) &&
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(product => (
                  <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group text-right flex flex-col h-full"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white text-primary p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Plus size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 w-full">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-black text-slate-900 dark:text-white truncate flex-1">{product.name}</h4>
                        {product.category && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between">
                        <span className="text-sm font-black text-primary">{(product.defaultPrice || 0).toLocaleString()} IQD</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary" />
                  {t('cart')}
                </h3>
                <span className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                  {cart.reduce((acc, item) => acc + (item.quantity || 0), 0)} Items
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest">{t('empty_cart')}</p>
                </div>
              ) : (
                cart.map(item => {
                  if (!item.product) return null;
                  return (
                    <div key={item.product.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="m-auto mt-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs font-black text-primary">{(item.price || 0).toLocaleString()} IQD</div>
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, -1)} 
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, 1)} 
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={cartCustomer} 
                    onChange={(e) => setCartCustomer(e.target.value)}
                    placeholder={t('customer_name_placeholder')}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                
                <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setCartStatus('paid')}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${cartStatus === 'paid' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <CheckCircle size={14} />
                    دراوە
                  </button>
                  <button 
                    onClick={() => setCartStatus('pending')}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${cartStatus === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Clock size={14} />
                    قەرز
                  </button>
                </div>

                {cartStatus === 'pending' && (
                  <div className="relative animate-in fade-in slide-in-from-top-2">
                    <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      value={cartDueDate}
                      onChange={(e) => setCartDueDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-slate-500">{t('total')}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0).toLocaleString()} IQD</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <span>{t('checkout')}</span>
                <ChevronRight size={18} className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AccountsView;
