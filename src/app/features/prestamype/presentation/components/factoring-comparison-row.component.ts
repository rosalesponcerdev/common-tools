import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';

type ClientRating = 'A+' | 'A' | 'B' | 'C' | 'D';
type ProductType = 'factoring' | 'confirming';
type Winner = 'factoring' | 'plazofijo';

@Component({
  selector: 'app-factoring-comparison-row',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './factoring-comparison-row.component.html',
  styleUrl: './factoring-comparison-row.component.css',
})
export class FactoringComparisonRowComponent {
  readonly product = input.required<ProductType>();
  readonly promotionWarrantyApplied = input.required<boolean>();
  readonly clientTradeName = input.required<string>();
  readonly clientName = input.required<string>();
  readonly clientRating = input.required<ClientRating>();
  readonly targetAmount = input.required<number>();
  readonly percentageFinanced = input.required<number>();

  readonly factoringDiasRestantes = input.required<number>();
  readonly factoringMontoInvertido = input.required<number>();
  readonly factoringGananciaNeta = input.required<number>();
  readonly factoringTeaNetaReal = input.required<number>();
  readonly factoringEsMasRentable = input.required<boolean>();

  readonly plazoFijoGananciaNeta = input.required<number>();
  readonly plazoFijoTea = input.required<number>();
  readonly plazoFijoEsMasRentable = input.required<boolean>();

  readonly winner = input.required<Winner>();
  readonly montoInversion = input.required<number>();

  readonly ratingClass = computed(() => {
    const rating = this.clientRating();
    const classes: Record<ClientRating, string> = {
      'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      A: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      B: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      C: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      D: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return classes[rating] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
  });

  readonly productClass = computed(() => {
    return this.product() === 'factoring'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
  });

  readonly montoMaximo = computed(() => {
    return this.targetAmount() * (1 - this.percentageFinanced() / 100);
  });

  readonly excedeMonto = computed(() => {
    return this.montoInversion() > this.montoMaximo();
  });

  readonly factoringWinner = computed(() => {
    return this.factoringEsMasRentable() && !this.excedeMonto();
  });

  readonly plazoFijoWinner = computed(() => {
    return this.plazoFijoEsMasRentable() && !this.excedeMonto();
  });
}
