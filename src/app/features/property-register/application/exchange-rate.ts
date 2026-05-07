export const DEFAULT_EXCHANGE_RATE = 3.7;
export const DEFAULT_EXCHANGE_RATE_BUY = 3.65;
export const DEFAULT_EXCHANGE_RATE_SELL = 3.75;

export interface ExchangeRate {
  value: number;
  buyRate: number;
  sellRate: number;
  updatedAt: string;
}

export const DEFAULT_EXCHANGE_RATE_DATA: ExchangeRate = {
  value: DEFAULT_EXCHANGE_RATE,
  buyRate: DEFAULT_EXCHANGE_RATE_BUY,
  sellRate: DEFAULT_EXCHANGE_RATE_SELL,
  updatedAt: new Date().toISOString(),
};
