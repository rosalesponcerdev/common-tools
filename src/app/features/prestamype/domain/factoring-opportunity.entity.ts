export type ClientRating = 'A+' | 'A' | 'B' | 'C' | 'D';
export type Currency = 'USD' | 'PEN';
export type ProductType = 'factoring' | 'confirming';

export interface Client {
  name: string;
  tradeName: string;
  rating: ClientRating;
}

export interface FactoringOpportunity {
  _id: string;
  client: Client;
  target_amount: number;
  currency: Currency;
  financing_interest_rate: number;
  payment_date: string;
  percentage_financed: number;
  product: ProductType;
  promotion_warranty_applied: boolean;
}

export type SortField =
  | 'type'
  | 'rating'
  | 'promotion'
  | 'gananciaFactoring'
  | 'gananciaPlazoFijo'
  | 'diferencia'
  | 'tea'
  | 'dias';
export type GroupField = 'none' | 'type' | 'rating' | 'promotion';

export interface GroupedResults {
  key: string;
  label: string;
  results: ComparisonResult[];
}

export interface FactoringResult {
  readonly opportunity: FactoringOpportunity;
  readonly diasRestantes: number;
  readonly montoInvertido: number;
  readonly gananciaBruta: number;
  readonly comision: number;
  readonly igv: number;
  readonly impuestoRenta: number;
  readonly gananciaNeta: number;
  readonly teaNetaReal: number;
  readonly esMasRentable: boolean;
}

export interface PlazoFijoResult {
  readonly montoInvertido: number;
  readonly gananciaBruta: number;
  readonly gananciaNeta: number;
  readonly tea: number;
  readonly esMasRentable: boolean;
}

export interface ComparisonResult {
  readonly factoring: FactoringResult;
  readonly plazoFijo: PlazoFijoResult;
  readonly winner: 'factoring' | 'plazofijo';
}
