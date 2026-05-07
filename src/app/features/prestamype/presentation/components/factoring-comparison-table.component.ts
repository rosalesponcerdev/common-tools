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
          <tr class="border-b border-gray-200 dark:border-slate-700">
            <th
              class="text-left py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Tipo
            </th>
            <th
              class="text-left py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Cliente
            </th>
            <th
              class="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Promo
            </th>
            <th
              class="text-right py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Días
            </th>
            <th
              class="text-right py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Inversión
            </th>
            <th
              class="text-right py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Factoring
            </th>
            <th
              class="text-right py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Plazo Fijo
            </th>
            <th
              class="text-center py-2.5 px-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]"
            >
              Mejor
            </th>
          </tr>
        </thead>
        <tbody>
          @for (result of resultados(); track result.factoring.opportunity._id) {
            <tr
              class="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              [class.bg-red-50]="excedeMontoMaximo(result)"
              [class.dark:bg-red-900/10]="excedeMontoMaximo(result)"
            >
              <!-- Tipo -->
              <td class="py-2 px-2">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  [class]="getProductClass(result.factoring.opportunity.product)"
                >
                  {{ result.factoring.opportunity.product === 'factoring' ? 'F' : 'C' }}
                </span>
              </td>

              <!-- Cliente -->
              <td class="py-2 px-2">
                <div class="flex items-center gap-1.5">
                  <div class="flex flex-col gap-1">
                    <span
                      class="font-medium text-gray-900 dark:text-white truncate max-w-[160px]"
                      [title]="result.factoring.opportunity.client.tradeName"
                    >
                      {{ result.factoring.opportunity.client.tradeName }}
                    </span>
                    <span
                      class="font-light text-[10px] text-gray-500 dark:text-white truncate max-w-[160px]"
                      [title]="result.factoring.opportunity.client.name"
                    >
                      {{ result.factoring.opportunity.client.name }}
                    </span>
                  </div>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                    [class]="getRatingClass(result.factoring.opportunity.client.rating)"
                  >
                    {{ result.factoring.opportunity.client.rating }}
                  </span>
                </div>
                <div class="text-[10px] text-gray-400 dark:text-gray-500">
                  max S/ {{ getMontoMaximo(result.factoring.opportunity) | number: '1.0-0' }}
                  @if (excedeMontoMaximo(result)) {
                    <span class="text-red-500 font-semibold">(⚠)</span>
                  }
                </div>
              </td>

              <!-- Promo -->
              <td class="py-2 px-2 text-center">
                @if (result.factoring.opportunity.promotion_warranty_applied) {
                  <span class="text-sm" title="Con garantía">🛡️</span>
                }
              </td>

              <!-- Días -->
              <td class="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">
                {{ result.factoring.diasRestantes }}
              </td>

              <!-- Inversión -->
              <td class="text-right py-2 px-3">
                <span class="text-gray-700 dark:text-gray-300 font-medium">
                  {{ result.factoring.montoInvertido | number: '1.0-0' }}
                </span>
              </td>

              <!-- Factoring -->
              <td class="text-right py-2 px-3">
                <span
                  class="font-bold"
                  [class.text-emerald-600]="
                    result.factoring.esMasRentable && !excedeMontoMaximo(result)
                  "
                  [class.dark:text-emerald-400]="
                    result.factoring.esMasRentable && !excedeMontoMaximo(result)
                  "
                  [class.text-gray-400]="
                    !result.factoring.esMasRentable || excedeMontoMaximo(result)
                  "
                  [class.dark:text-gray-500]="
                    !result.factoring.esMasRentable || excedeMontoMaximo(result)
                  "
                >
                  {{ result.factoring.gananciaNeta | number: '1.2-2' }}
                </span>
                <div class="text-[10px] text-gray-400 dark:text-gray-500">
                  {{ result.factoring.teaNetaReal * 100 | number: '1.1-1' }}% TEA
                </div>
              </td>

              <!-- Plazo Fijo -->
              <td class="text-right py-2 px-3">
                <span
                  class="font-bold"
                  [class.text-emerald-600]="
                    result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)
                  "
                  [class.dark:text-emerald-400]="
                    result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)
                  "
                  [class.text-gray-400]="
                    !result.plazoFijo.esMasRentable || excedeMontoMaximo(result)
                  "
                  [class.dark:text-gray-500]="
                    !result.plazoFijo.esMasRentable || excedeMontoMaximo(result)
                  "
                >
                  {{ result.plazoFijo.gananciaNeta | number: '1.2-2' }}
                </span>
                <div class="text-[10px] text-gray-400 dark:text-gray-500">
                  {{ result.plazoFijo.tea * 100 | number: '1.1-1' }}% TEA
                </div>
              </td>

              <!-- Winner -->
              <td class="text-center py-2 px-3">
                @if (excedeMontoMaximo(result)) {
                  <span class="text-xs font-bold text-red-600 dark:text-red-400">⚠️</span>
                } @else if (result.winner === 'factoring') {
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">📄</span>
                } @else {
                  <span class="text-xs font-bold text-amber-600 dark:text-amber-400">🏦</span>
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
