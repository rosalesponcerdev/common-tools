import { computed, inject, Injectable, signal } from '@angular/core';
import { form, max, min, PathKind, required, SchemaPathTree } from '@angular/forms/signals';
import { CalculateFactoringUseCase } from '../../application';
import {
  calculateMontoMaximo,
  ComparisonResult,
  FactoringOpportunity,
  GroupedResults,
  GroupField,
  SortField,
} from '../../domain';

export interface FactoringCalculatorState {
  jsonInput: string;
  montoInversion: number;
  teaPlazoFijo: number;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  groupField: GroupField;
}

export interface CalculationOutput {
  results: ComparisonResult[];
  filteredCount: number;
  currencyFiltered: string;
}

export interface ParsedOpportunities {
  opportunities: FactoringOpportunity[];
  error: string | null;
}

function parseOpportunities(json: string): ParsedOpportunities {
  if (!json.trim()) {
    return { opportunities: [], error: null };
  }

  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return { opportunities: [], error: 'El JSON debe ser un array de facturas' };
    }

    const validOpportunities: FactoringOpportunity[] = [];
    const errors: string[] = [];

    for (const item of parsed) {
      if (!item._id || !item.client?.name || !item.target_amount) {
        errors.push(`Fila ${parsed.indexOf(item) + 1}: datos incompletos`);
        continue;
      }

      if (!item.financing_interest_rate || !item.payment_date) {
        errors.push(`Fila ${parsed.indexOf(item) + 1}: faltan datos financieros`);
        continue;
      }

      const validRating = ['A+', 'A', 'B', 'C', 'D'].includes(item.client.rating);
      const validCurrency = ['USD', 'PEN'].includes(item.currency);
      const validProduct = ['factoring', 'confirming'].includes(item.product);

      if (!validRating) {
        errors.push(`Fila ${parsed.indexOf(item) + 1}: rating inválido`);
        continue;
      }

      if (!validCurrency) {
        errors.push(`Fila ${parsed.indexOf(item) + 1}: moneda inválida (solo USD o PEN)`);
        continue;
      }

      if (!validProduct) {
        errors.push(
          `Fila ${parsed.indexOf(item) + 1}: producto inválido (solo factoring o confirming)`,
        );
        continue;
      }

      validOpportunities.push({
        _id: item._id,
        client: {
          tradeName: item.client.trade_name,
          name: item.client.name,
          rating: item.client.rating,
        },
        target_amount: item.target_amount,
        currency: item.currency,
        financing_interest_rate: item.financing_interest_rate,
        payment_date: item.payment_date,
        percentage_financed: item.percentage_financed || 0,
        product: item.product,
        promotion_warranty_applied: item.promotion_warranty_applied || false,
      });
    }

    if (errors.length > 0 && validOpportunities.length === 0) {
      return { opportunities: [], error: errors.join('. ') };
    }
    return {
      opportunities: validOpportunities,
      error: errors.length > 0 ? errors.join('. ') : null,
    };
  } catch {
    return { opportunities: [], error: 'JSON inválido' };
  }
}

const factoringFormValidation = (
  schema: SchemaPathTree<FactoringCalculatorState, PathKind.Root>,
) => {
  required(schema.montoInversion);
  min(schema.montoInversion, 0);
  required(schema.teaPlazoFijo);
  min(schema.teaPlazoFijo, 0);
  max(schema.teaPlazoFijo, 1);
};

@Injectable()
export class FactoringCalculatorFacade {
  private readonly calculateFactoringUseCase = inject(CalculateFactoringUseCase);

  protected readonly _state = signal<FactoringCalculatorState>({
    jsonInput: '',
    montoInversion: 0,
    teaPlazoFijo: 0.045,
    sortField: 'type',
    sortDirection: 'asc',
    groupField: 'none',
  });

  public readonly factoringForm = form(this._state, factoringFormValidation);

  readonly opportunities = computed(() => {
    return parseOpportunities(this.factoringForm.jsonInput().value());
  });

  readonly isMontoValido = computed(() => {
    const monto = this.factoringForm.montoInversion().value();
    const output = this.calculoOutput();
    if (output.results.length === 0) return true;
    return (
      monto > 0 &&
      output.results.every((r) => monto <= calculateMontoMaximo(r.factoring.opportunity))
    );
  });

  readonly parseError = computed(() => {
    const opportunities = this.opportunities();
    return opportunities.error;
  });

  readonly calculoOutput = computed((): CalculationOutput => {
    const opportunitiesResult = this.opportunities();
    const opportunities = opportunitiesResult.opportunities;
    const monto = this.factoringForm.montoInversion().value();
    const teaPF = this.factoringForm.teaPlazoFijo().value();

    if (opportunities.length === 0 || monto <= 0) {
      return { results: [], filteredCount: 0, currencyFiltered: '' };
    }

    const output = this.calculateFactoringUseCase.execute({
      opportunities,
      montoInversion: monto,
      teaPlazoFijo: teaPF,
    });

    return {
      results: output.results,
      filteredCount: output.filteredCount,
      currencyFiltered: output.currencyFiltered,
    };
  });

  readonly filteredInfo = computed(() => {
    const output = this.calculoOutput();
    return {
      count: output.filteredCount,
      currency: output.currencyFiltered,
    };
  });

  readonly comparacionResultados = computed(() => {
    return this.orderedResults();
  });

  readonly groupedResults = computed((): GroupedResults[] => {
    const results = this.orderedResults();
    const groupField = this.factoringForm.groupField().value();

    if (groupField === 'none') {
      return [{ key: 'all', label: 'Todos', results }];
    }

    const groups = new Map<string, ComparisonResult[]>();

    results.forEach((r) => {
      let key: string;
      let label: string;

      const opp = r.factoring.opportunity;

      switch (groupField) {
        case 'type':
          key = opp.product;
          label = opp.product === 'factoring' ? 'Factoring' : 'Confirming';
          break;
        case 'rating':
          key = opp.client.rating;
          label = `Rating ${opp.client.rating}`;
          break;
        case 'promotion':
          key = opp.promotion_warranty_applied ? 'with-warranty' : 'without-warranty';
          label = opp.promotion_warranty_applied ? 'Con garantía' : 'Sin garantía';
          break;
        default:
          key = 'all';
          label = 'Todos';
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(r);
    });

    const order: Record<string, number> = {
      factoring: 1,
      confirming: 2,
      'A+': 1,
      A: 2,
      B: 3,
      C: 4,
      D: 5,
      'with-warranty': 1,
      'without-warranty': 2,
    };

    return Array.from(groups.entries())
      .sort(([a], [b]) => (order[a] || 99) - (order[b] || 99))
      .map(([key, results]) => {
        let displayLabel: string;
        switch (key) {
          case 'factoring':
            displayLabel = 'Factoring';
            break;
          case 'confirming':
            displayLabel = 'Confirming';
            break;
          case 'with-warranty':
            displayLabel = 'Con garantía';
            break;
          case 'without-warranty':
            displayLabel = 'Sin garantía';
            break;
          default:
            displayLabel = key.startsWith('Rating') ? key : key;
        }
        return {
          key,
          label: `${displayLabel} (${results.length})`,
          results,
        };
      });
  });

  private orderedResults(): ComparisonResult[] {
    const results = this.calculoOutput().results;
    const sortField = this.factoringForm.sortField().value();
    const direction = this.factoringForm.sortDirection().value();

    if (results.length === 0) return [];

    const ratingOrder: Record<string, number> = { 'A+': 1, A: 2, B: 3, C: 4, D: 5 };

    return [...results].sort((a, b) => {
      let cmp = 0;

      switch (sortField) {
        case 'type':
          cmp = a.factoring.opportunity.product.localeCompare(b.factoring.opportunity.product);
          break;
        case 'rating':
          cmp =
            (ratingOrder[a.factoring.opportunity.client.rating] || 99) -
            (ratingOrder[b.factoring.opportunity.client.rating] || 99);
          break;
        case 'promotion':
          cmp =
            (b.factoring.opportunity.promotion_warranty_applied ? 1 : 0) -
            (a.factoring.opportunity.promotion_warranty_applied ? 1 : 0);
          break;
        case 'gananciaFactoring':
          cmp = a.factoring.gananciaNeta - b.factoring.gananciaNeta;
          break;
        case 'gananciaPlazoFijo':
          cmp = a.plazoFijo.gananciaNeta - b.plazoFijo.gananciaNeta;
          break;
        case 'diferencia':
          cmp =
            a.factoring.gananciaNeta -
            a.plazoFijo.gananciaNeta -
            (b.factoring.gananciaNeta - b.plazoFijo.gananciaNeta);
          break;
        case 'tea':
          cmp = a.factoring.teaNetaReal - b.factoring.teaNetaReal;
          break;
        case 'dias':
          cmp = a.factoring.diasRestantes - b.factoring.diasRestantes;
          break;
      }

      return direction === 'asc' ? cmp : -cmp;
    });
  }

  toggleSortDirection(): void {
    const current = this.factoringForm.sortDirection().value();
    this._state.update((s) => ({ ...s, sortDirection: current === 'asc' ? 'desc' : 'asc' }));
  }
}
