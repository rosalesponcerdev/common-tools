import { ExchangeRate, DEFAULT_EXCHANGE_RATE_DATA, DEFAULT_EXCHANGE_RATE_BUY, DEFAULT_EXCHANGE_RATE_SELL } from '../application/exchange-rate';

const EXCHANGE_RATE_KEY = 'property_register_exchange_rate';

export class ExchangeRateStorage {
  get(): ExchangeRate {
    const data = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (!data) return DEFAULT_EXCHANGE_RATE_DATA;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_EXCHANGE_RATE_DATA;
    }
  }

  save(exchangeRate: ExchangeRate): void {
    localStorage.setItem(EXCHANGE_RATE_KEY, JSON.stringify(exchangeRate));
  }

  update(value: number, buyRate?: number, sellRate?: number): ExchangeRate {
    const newRate: ExchangeRate = {
      value,
      buyRate: buyRate ?? value - 0.05,
      sellRate: sellRate ?? value + 0.05,
      updatedAt: new Date().toISOString(),
    };
    this.save(newRate);
    return newRate;
  }

  updateFull(buyRate: number, sellRate: number): ExchangeRate {
    const value = (buyRate + sellRate) / 2;
    const newRate: ExchangeRate = {
      value,
      buyRate,
      sellRate,
      updatedAt: new Date().toISOString(),
    };
    this.save(newRate);
    return newRate;
  }

  reset(): void {
    localStorage.removeItem(EXCHANGE_RATE_KEY);
  }
}