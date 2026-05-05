import { inject, computed, signal, Injectable } from '@angular/core';
import {
  form,
  maxLength,
  PathKind,
  required,
  SchemaPathTree,
  min,
  max,
} from '@angular/forms/signals';
import {
  FactoringOpportunity,
  ComparisonResult,
  getTotalDisponible,
  calculateMontoMaximo,
} from '../../domain';
import { CalculateFactoringUseCase } from '../../application';

export interface FactoringCalculatorState {
  jsonInput: string;
  montoInversion: number;
  teaPlazoFijo: number;
}

export interface CalculationOutput {
  results: ComparisonResult[];
  filteredCount: number;
  currencyFiltered: string;
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
    teaPlazoFijo: 0.07,
  });

  protected readonly _parsedOpportunities = signal<FactoringOpportunity[]>([]);
  protected readonly _parseError = signal<string | null>(null);

  public readonly factoringForm = form(this._state, factoringFormValidation);

  readonly jsonInput = computed(() => this._state().jsonInput);
  readonly montoInversion = computed(() => this._state().montoInversion);
  readonly teaPlazoFijo = computed(() => this._state().teaPlazoFijo);
  readonly parseError = computed(() => this._parseError());
  readonly opportunities = computed(() => this._parsedOpportunities());

  readonly totalDisponible = computed(() => {
    return getTotalDisponible(this._parsedOpportunities());
  });

  readonly isMontoValido = computed(() => {
    const monto = this.montoInversion();
    const output = this.calculoOutput();
    if (output.results.length === 0) return true;
    return monto > 0 && output.results.every((r) => monto <= calculateMontoMaximo(r.factoring.opportunity));
  });

  readonly calculoOutput = computed((): CalculationOutput => {
    const opportunities = this._parsedOpportunities();
    const monto = this.montoInversion();
    const teaPF = this.teaPlazoFijo();

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
    return this.calculoOutput().results;
  });

  updateJsonInput(value: string): void {
    this._state.update((s) => ({ ...s, jsonInput: value }));
    this.parseOpportunities(value);
  }

  updateMontoInversion(value: number): void {
    this._state.update((s) => ({ ...s, montoInversion: value }));
  }

  updateTeaPlazoFijo(value: number): void {
    this._state.update((s) => ({ ...s, teaPlazoFijo: value }));
  }

  private parseOpportunities(json: string): void {
    if (!json.trim()) {
      this._parsedOpportunities.set([]);
      this._parseError.set(null);
      return;
    }

    try {
      const parsed = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        throw new Error('El JSON debe ser un array de facturas');
      }

      const validOpportunities: FactoringOpportunity[] = [];
      const errors: string[] = [];

      parsed.forEach((item, index) => {
        if (!item._id || !item.client?.name || !item.target_amount) {
          errors.push(`Fila ${index + 1}: datos incompletos`);
          return;
        }

        if (!item.financing_interest_rate || !item.payment_date) {
          errors.push(`Fila ${index + 1}: faltan datos financieros`);
          return;
        }

        const validRating = ['A+', 'A', 'B', 'C', 'D'].includes(item.client.rating);
        const validCurrency = ['USD', 'PEN'].includes(item.currency);

        if (!validRating) {
          errors.push(`Fila ${index + 1}: rating inválido`);
          return;
        }

        if (!validCurrency) {
          errors.push(`Fila ${index + 1}: moneda inválida (solo USD o PEN)`);
          return;
        }

        validOpportunities.push({
          _id: item._id,
          client: {
            name: item.client.name,
            rating: item.client.rating,
          },
          target_amount: item.target_amount,
          currency: item.currency,
          financing_interest_rate: item.financing_interest_rate,
          payment_date: item.payment_date,
          percentage_financed: item.percentage_financed || 0,
        });
      });

      if (errors.length > 0 && validOpportunities.length === 0) {
        this._parseError.set(errors.join('. '));
        this._parsedOpportunities.set([]);
      } else {
        this._parseError.set(errors.length > 0 ? errors.join('. ') : null);
        this._parsedOpportunities.set(validOpportunities);
      }
    } catch {
      this._parseError.set('JSON inválido');
      this._parsedOpportunities.set([]);
    }
  }
}