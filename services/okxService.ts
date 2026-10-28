
import { CryptoRate } from '../types.ts';

class OKXService {
  private ws: WebSocket | null = null;
  private symbols: string[] = [];
  private onUpdate: (rates: CryptoRate[]) => void;
  private rates: Map<string, CryptoRate> = new Map();
  private reconnectTimeout: any = null;

  constructor() {
    this.symbols = [];
    this.onUpdate = () => {};
  }

  init(symbols: string[], onUpdate: (rates: CryptoRate[]) => void) {
    this.symbols = symbols;
    this.onUpdate = onUpdate;
    this.connect();
  }

  private connect() {
    if (this.ws) {
      this.ws.close();
    }

    // OKX Public WebSocket Endpoint
    this.ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

    this.ws.onopen = () => {
      console.log('OKX WebSocket Connected');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Subscribe to tickers for all symbols
      const args = this.symbols.map(symbol => ({
        channel: 'tickers',
        instId: symbol
      }));

      this.ws?.send(JSON.stringify({
        op: 'subscribe',
        args: args
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.event === 'subscribe') {
          console.log('Subscribed to:', response.arg.instId);
          return;
        }

        if (response.arg?.channel === 'tickers' && response.data) {
          const ticker = response.data[0];
          const instId = ticker.instId;
          const lastPrice = parseFloat(ticker.last);
          const open24h = parseFloat(ticker.open24h);
          const change24h = ((lastPrice - open24h) / open24h) * 100;

          const cryptoRate: CryptoRate = {
            id: instId,
            name: instId.split('-')[0],
            symbol: instId.split('-')[0],
            price: lastPrice,
            change24h: change24h,
            lastUpdated: new Date().toISOString(),
            category: 'crypto',
            icon: `https://static.okx.com/cdn/oksupport/asset/currency/icon/${instId.split('-')[0].toLowerCase()}.png`
          };

          this.rates.set(instId, cryptoRate);
          
          // Throttled update to avoid overwhelming React state if needed, 
          // but for millisecond feel, we send it directly.
          // The user specifically asked for millisecond accuracy.
          this.onUpdate(Array.from(this.rates.values()));
        }
      } catch (error) {
        console.error('Error parsing OKX message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('OKX WebSocket Error:', error);
    };

    this.ws.onclose = () => {
      console.log('OKX WebSocket Closed. Reconnecting in 5s...');
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    };
  }

  updateSymbols(newSymbols: string[]) {
    this.symbols = newSymbols;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.connect(); // Re-subscribe by reconnecting (simplest way to reset subscriptions)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const okxService = new OKXService();
