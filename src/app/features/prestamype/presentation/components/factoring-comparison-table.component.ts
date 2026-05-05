import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ComparisonResult } from '../../domain';

@Component({
  selector: 'app-factoring-comparison-table',
  imports: [DecimalPipe],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-zinc-200 dark:border-zinc-700">
            <th class="text-left py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Tipo
            </th>
            <th class="text-left py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Cliente
            </th>
            <th class="text-center py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Promo
            </th>
            <th class="text-right py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Días
            </th>
            <th class="text-right py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Inversión
            </th>
            <th class="text-right py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Factoring
            </th>
            <th class="text-right py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Plazo Fijo
            </th>
            <th class="text-center py-2 px-2 font-medium text-zinc-600 dark:text-zinc-400">
              Mejor
            </th>
          </tr>
        </thead>
        <tbody>
          @for (result of resultados(); track result.factoring.opportunity._id) {
            <tr
              class="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              [class.bg-red-50]="excedeMontoMaximo(result)"
              [class.dark:bg-red-900/10]="excedeMontoMaximo(result)"
            >
              <td class="py-2 px-2">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  [class]="getProductClass(result.factoring.opportunity.product)"
                >
                  {{ result.factoring.opportunity.product === 'factoring' ? 'Factoring' : 'Confirming' }}
                </span>
              </td>
              <td class="py-2 px-2">
                <div class="flex items-center gap-1.5">
                  <span class="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                    {{ result.factoring.opportunity.client.name }}
                  </span>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                    [class]="getRatingClass(result.factoring.opportunity.client.rating)"
                  >
                    {{ result.factoring.opportunity.client.rating }}
                  </span>
                </div>
                <div class="text-[10px] text-zinc-400 dark:text-zinc-500">
                  max S/ {{ getMontoMaximo(result.factoring.opportunity) | number:'1.0-0' }}
                  @if (excedeMontoMaximo(result)) {
                    <span class="text-red-500 font-medium">(⚠)</span>
                  }
                </div>
              </td>
              <td class="py-2 px-2 text-center">
                @if (result.factoring.opportunity.promotion_warranty_applied) {
                  <span class="text-sm" title="Con garantía">🛡️</span>
                }
              </td>
              <td class="text-right py-2 px-3 text-zinc-500 dark:text-zinc-400">
                {{ result.factoring.diasRestantes }}
              </td>
              <td class="text-right py-2 px-3">
                <span class="text-zinc-700 dark:text-zinc-300">
                  {{ result.factoring.montoInvertido | number:'1.0-0' }}
                </span>
              </td>
              <td class="text-right py-2 px-3">
                <span
                  class="font-medium"
                  [class.text-green-600]="result.factoring.esMasRentable && !excedeMontoMaximo(result)"
                  [class.dark:text-green-400]="result.factoring.esMasRentable && !excedeMontoMaximo(result)"
                  [class.text-zinc-500]="!result.factoring.esMasRentable || excedeMontoMaximo(result)"
                  [class.dark:text-zinc-400]="!result.factoring.esMasRentable || excedeMontoMaximo(result)"
                >
                  {{ result.factoring.gananciaNeta | number:'1.2-2' }}
                </span>
                <div class="text-[10px] text-zinc-400">
                  {{ result.factoring.teaNetaReal * 100 | number:'1.1-1' }}%
                </div>
              </td>
              <td class="text-right py-2 px-3">
                <span
                  class="font-medium"
                  [class.text-green-600]="result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)"
                  [class.dark:text-green-400]="result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)"
                  [class.text-zinc-500]="!result.plazoFijo.esMasRentable || excedeMontoMaximo(result)"
                  [class.dark:text-zinc-400]="!result.plazoFijo.esMasRentable || excedeMontoMaximo(result)"
                >
                  {{ result.plazoFijo.gananciaNeta | number:'1.2-2' }}
                </span>
                <div class="text-[10px] text-zinc-400">
                  {{ result.plazoFijo.tea * 100 | number:'1.1-1' }}%
                </div>
              </td>
              <td class="text-center py-2 px-3">
                @if (excedeMontoMaximo(result)) {
                  <span class="text-[10px] font-medium text-red-600 dark:text-red-400">⚠️</span>
                } @else if (result.winner === 'factoring') {
                  <span class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">📄</span>
                } @else {
                  <span class="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">🏦</span>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoringComparisonTableComponent {
  readonly resultados = input.required<ComparisonResult[]>();
  readonly montoInversion = input.required<number>();
  readonly showGroupHeader = input<boolean>(false);

  getRatingClass(rating: string): string {
    const classes: Record<string, string> = {
      'A+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      A: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      B: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      C: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      D: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return classes[rating] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300';
  }

  getProductClass(product: string): string {
    return product === 'factoring'
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
  }

  getMontoMaximo(opportunity: { target_amount: number; percentage_financed: number }): number {
    return opportunity.target_amount * (1 - opportunity.percentage_financed / 100);
  }

  excedeMontoMaximo(result: ComparisonResult): boolean {
    const maximo = this.getMontoMaximo(result.factoring.opportunity);
    return this.montoInversion() > maximo;
  }
}