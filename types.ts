
export interface CurrencyRate {
  id: string;
  name: string;
  code: string;
  flag: string;
  buy: number;
  sell: number;
  change24h: number;
  lastUpdated: string;
  category: string;
  isPremium?: boolean;
}

export interface CryptoRate {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  lastUpdated: string;
  category?: string;
}

export interface MetalRate {
  id: string;
  name: string;
  symbol?: string;
  buy: number;
  sell: number;
  price?: number;
  unit: string;
  lastUpdated: string;
  category?: string;
  change?: string;
  change24h?: number;
}


export interface Headline {
  id: string;
  text: string;
  date: string;
  active: boolean;
}

export interface Ad {
  id: string;
  type: 'image' | 'video';
  url: string;
  link?: string;
  title?: string;
  description?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '21:9' | '2:1' | '3:1' | '4:1' | '5:1' | '6:1';
}

export interface User {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  password?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  role: string; // Comma-separated roles like 'admin,editor'
  status: 'pending' | 'approved' | 'blocked';
  activityPoints?: number;
  createdAt: string;
  expiresAt?: string; // ISO date string for expiration
  avatar?: string;
  theme?: string;
  language?: string;
  wallet?: {
    balance: number;
    currency: string;
    address?: string;
    history?: WalletTransaction[];
    savingsGoal?: {
      targetAmount: number;
      currentAmount: number;
      name: string;
      deadline?: string;
    };
  };
}

export interface WalletTransaction {
  id: string;
  type: 'expense' | 'income' | 'salary' | 'work';
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  readBy: string[]; // Array of user IDs who have read it
}

export interface AppConfig {
  appName: string;
  isRankingVisible: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderRadius: number;
  fontSize: number;
  layoutMode: 'table' | 'grid';
  cardDisplayMode: 'horizontal' | 'vertical';
  notificationsEnabled: boolean;
  translations: Record<string, Record<string, string>>;
  enabledTabs?: string[];
  tabNames?: Record<string, string>;
  tabIcons?: Record<string, string>;
  ledgerTitle?: string;
  enableAccountsView?: boolean;
  enableAdminPanel?: boolean;
  aboutMeText?: string;
  enableMarketSync?: boolean;
  disableCardGlow?: boolean;
  appPower?: boolean;
  isLocalMarketLocked?: boolean;
  disableMarqueeAnimation?: boolean;
  marqueeSpeed?: number;
  marqueePaused?: boolean;
  customMarqueeText?: string;
  useCustomMarquee?: boolean;
  cardPadding?: number;
  cardShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontFamily?: string;
  goldTextFont?: string;
  adDisplayMode?: 'list' | 'slider';
  adAspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '21:9' | '2:1' | '3:1' | '4:1' | '5:1' | '6:1';
  adAutoPlay?: boolean;
  appVersion?: string;
  aboutAppText?: string;
  appFeatures?: string[];
  logoVersion?: number;
  customLogo?: string;
  splashLogo?: string;
  favicon?: string;
  enableCryptoView?: boolean;
  okxSymbols?: string[];
  roles?: { name: string, permissions: string[], icon?: string }[];
  facebookLink?: string;
  bannerTitle?: string;
  bannerImage?: string;
  bannerSubtitle?: string;
  bannerValue?: string;
  globalFontSize?: number;
  maintenanceMode?: boolean;
  modMenuTheme?: 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate' | 'rainbow';
  modMenuRainbowMode?: boolean;
  modMenuGhostMode?: boolean;
  modMenuSpeedHack?: boolean;
  modMenuSectionOrder?: string[];
  modMenuCustomCSS?: string;
  modMenuMatrixMode?: boolean;
  modMenuSoundEffects?: boolean;
  modMenuShowHitboxes?: boolean;
  modMenuPerformanceMonitor?: boolean;
  modMenuAccentColor?: string;
  modMenuGlassEffect?: boolean;
  modMenuAnimations?: boolean;
  modMenuScreenShake?: boolean;
  modMenuConfetti?: boolean;
  modMenuFPSCounter?: boolean;
  modMenuMouseTracker?: boolean;
  modMenuAutoClicker?: boolean;
  modMenuScreenshotMode?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  image?: string;
  defaultPrice: number; // Selling Price
  costPrice?: number;
  quantity?: number;
  barcode?: string;
  wholesalePrice?: number;
  expiryDate?: string;
  socialLink?: string;
  note?: string;
  category?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell' | 'expense' | 'rent';
  itemName: string;
  image?: string; // Base64 or URL for product image
  amount: number;
  price: number;
  total: number;
  profit?: number; // Manual profit/loss entry
  date: string;
  note?: string;
  customerName?: string;
  status?: 'paid' | 'pending'; // pending = Qarz
  dueDate?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  userId: string;
  userName: string;
  message: string;
  imageUrl?: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: string;
  replies: {
    id: string;
    userId: string;
    userName: string;
    message: string;
    imageUrl?: string;
    createdAt: string;
  }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'add' | 'edit' | 'delete' | 'update' | 'login' | 'logout';
  target: 'product' | 'transaction' | 'user' | 'category' | 'rate' | 'config' | 'headline' | 'ad' | 'ticket' | 'system';
  details: string;
}

export type ThemeMode = 'light' | 'dark' | 'system' | 'paper';
export type LanguageCode = 'ku' | 'ar' | 'en';
export type ViewMode = 'admin' | 'settings' | 'developer' | 'kargeri' | 'editor' | 'accounts' | 'activity' | 'ads' | 'features' | 'notifications' | 'wallet' | 'accounting';

export interface AccountingClient {
  id: string;
  name: string;
  phone?: string;
  debtUSD: number;
  debtIQD: number;
  debtToman?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingPartner {
  id: string;
  name: string;
  sharePercentage: number;
  capitalUSD: number;
  capitalIQD: number;
  capitalToman?: number;
  capitalGBP?: number;
  capitalEUR?: number;
  capitalTRY?: number;
  capitalSAR?: number;
  capitalAED?: number;
  joinedAt: string;
}

export interface Employee {
  id: string;
  userId?: string;
  storeOwnerUserId?: string;
  name: string;
  email: string;
  password?: string;
  role: 'employee' | 'admin';
  createdAt: string;
}

export interface AccountingTransaction {
  id: string;
  type: 'exchange_buy' | 'exchange_sell' | 'hawala_send' | 'hawala_receive' | 'expense' | 'payment' | 'partner_investment' | 'partner_withdrawal' | 'profit_distribution' | 'income';
  amount: number;
  currency: 'USD' | 'IQD' | 'TOMAN' | string;
  rate?: number;
  totalConverted?: number;
  targetCurrency?: string;
  profit?: number; // Profit/Loss for the transaction
  clientId?: string;
  clientName?: string;
  partnerId?: string;
  partnerName?: string;
  senderName?: string;
  receiverName?: string;
  destination?: string;
  category?: string;
  note?: string;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  createdBy: string;
  employeeId?: string;
}

export interface AccountingBalance {
  usd: number;
  iqd: number;
  toman?: number;
  extraCurrencies?: Record<string, number>;
  lastUpdated: string;
}
