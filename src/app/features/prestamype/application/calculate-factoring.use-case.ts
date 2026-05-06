import { inject } from '@angular/core';
import {
  FactoringOpportunity,
  ComparisonResult,
  calculateFactoring,
  calculatePlazoFijo,
  compareResults,
} from '../domain';

export interface CalculateFactoringInput {
  opportunities: FactoringOpportunity[];
  montoInversion: number;
  teaPlazoFijo: number;
}

export interface CalculateFactoringOutput {
  results: ComparisonResult[];
  filteredCount: number;
  currencyFiltered: string;
}

export class CalculateFactoringUseCase {
  execute(input: CalculateFactoringInput): CalculateFactoringOutput {
    const { opportunities, montoInversion, teaPlazoFijo } = input;

    if (opportunities.length === 0 || montoInversion <= 0) {
      return { results: [], filteredCount: 0, currencyFiltered: '' };
    }

    const penOpportunities = opportunities.filter((opp) => opp.currency === 'PEN');
    const usdCount = opportunities.length - penOpportunities.length;

    const results: ComparisonResult[] = penOpportunities.map((opp) => {
      const factoring = calculateFactoring(opp, montoInversion);
      const plazoFijo = calculatePlazoFijo(montoInversion, teaPlazoFijo, factoring.diasRestantes);

      return compareResults(factoring, plazoFijo);
    });

    return {
      results,
      filteredCount: usdCount,
      currencyFiltered: 'USD',
    };
  }
}
