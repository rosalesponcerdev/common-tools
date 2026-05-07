import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ComparisonResult } from '../../domain';

@Component({
  selector: 'app-factoring-comparison-row',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './factoring-comparison-row.component.html',
  styleUrl: './factoring-comparison-row.component.css',
})
export class FactoringComparisonRowComponent {
  readonly result = input.required<ComparisonResult>();
  readonly montoInversion = input.required<number>();

  readonly ratingClass = computed(() => {
    const rating = this.result().factoring.opportunity.client.rating;
    const classes: Record<string, string> = {
      'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      A: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      B: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      C: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      D: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return classes[rating] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
  });

  readonly productClass = computed(() => {
    const product = this.result().factoring.opportunity.product;
    return product === 'factoring'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
  });

  readonly montoMaximo = computed(() => {
    const opp = this.result().factoring.opportunity;
    return opp.target_amount * (1 - opp.percentage_financed / 100);
  });

  readonly excedeMonto = computed(() => {
    return this.montoInversion() > this.montoMaximo();
  });

  readonly factoringWinner = computed(() => {
    return this.result().factoring.esMasRentable && !this.excedeMonto();
  });

  readonly plazoFijoWinner = computed(() => {
    return this.result().plazoFijo.esMasRentable && !this.excedeMonto();
  });
}