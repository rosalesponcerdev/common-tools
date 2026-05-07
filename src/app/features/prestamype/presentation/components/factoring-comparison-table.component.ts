import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ComparisonResult } from '../../domain';

@Component({
  selector: 'app-factoring-comparison-table',
  imports: [DecimalPipe],
  templateUrl: './factoring-comparison-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoringComparisonTableComponent {
  readonly resultados = input.required<ComparisonResult[]>();
  readonly montoInversion = input.required<number>();
  readonly showGroupHeader = input<boolean>(false);

  getRatingClass(rating: string): string {
    const classes: Record<string, string> = {
      'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      A: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      B: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      C: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      D: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return classes[rating] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
  }

  getProductClass(product: string): string {
    return product === 'factoring'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
  }

  getMontoMaximo(opportunity: { target_amount: number; percentage_financed: number }): number {
    return opportunity.target_amount * (1 - opportunity.percentage_financed / 100);
  }

  excedeMontoMaximo(result: ComparisonResult): boolean {
    const maximo = this.getMontoMaximo(result.factoring.opportunity);
    return this.montoInversion() > maximo;
  }
}
