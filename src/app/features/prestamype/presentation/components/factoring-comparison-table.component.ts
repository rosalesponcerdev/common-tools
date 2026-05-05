import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ComparisonResult } from '../../domain';

@Component({
  selector: 'app-factoring-comparison-table',
  imports: [DecimalPipe],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-200 dark:border-zinc-700">
            <th class="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Cliente
            </th>
            <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Días
            </th>
            <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Inversión
            </th>
            <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Factoring (Neto)
            </th>
            <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Plazo Fijo (Neto)
            </th>
            <th class="text-center py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
              Mejor Opción
            </th>
          </tr>
        </thead>
        <tbody>
          @for (result of resultados(); track result.factoring.opportunity._id; let i = $index) {
            <tr
              class="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              [class.bg-red-50]="excedeMontoMaximo(result)"
              [class.dark:bg-red-900/10]="excedeMontoMaximo(result)"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-zinc-900 dark:text-zinc-100">
                    {{ result.factoring.opportunity.client.name }}
                  </span>
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="getRatingClass(result.factoring.opportunity.client.rating)"
                  >
                    {{ result.factoring.opportunity.client.rating }}
                  </span>
                </div>
                <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Max: S/ {{ getMontoMaximo(result.factoring.opportunity) | number:'1.2-2' }}
                  @if (excedeMontoMaximo(result)) {
                    <span class="text-red-600 dark:text-red-400 font-medium">(excede)</span>
                  }
                </div>
              </td>
              <td class="text-right py-3 px-4 text-zinc-600 dark:text-zinc-400">
                {{ result.factoring.diasRestantes }}
              </td>
              <td class="text-right py-3 px-4">
                <span class="font-medium text-zinc-900 dark:text-zinc-100">
                  S/ {{ result.factoring.montoInvertido | number:'1.2-2' }}
                </span>
              </td>
              <td class="text-right py-3 px-4">
                <span
                  class="font-medium"
                  [class.text-green-600]="result.factoring.esMasRentable && !excedeMontoMaximo(result)"
                  [class.dark:text-green-400]="result.factoring.esMasRentable && !excedeMontoMaximo(result)"
                  [class.text-zinc-600]="!result.factoring.esMasRentable || excedeMontoMaximo(result)"
                  [class.dark:text-zinc-400]="!result.factoring.esMasRentable || excedeMontoMaximo(result)"
                >
                  S/ {{ result.factoring.gananciaNeta | number:'1.2-2' }}
                </span>
                <div class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  TEA: {{ result.factoring.teaNetaReal * 100 | number:'1.2-2' }}%
                </div>
              </td>
              <td class="text-right py-3 px-4">
                <span
                  class="font-medium"
                  [class.text-green-600]="result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)"
                  [class.dark:text-green-400]="result.plazoFijo.esMasRentable && !excedeMontoMaximo(result)"
                  [class.text-zinc-600]="!result.plazoFijo.esMasRentable || excedeMontoMaximo(result)"
                  [class.dark:text-zinc-400]="!result.plazoFijo.esMasRentable || excedeMontoMaximo(result)"
                >
                  S/ {{ result.plazoFijo.gananciaNeta | number:'1.2-2' }}
                </span>
                <div class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  TEA: {{ result.plazoFijo.tea * 100 | number:'1.2-2' }}%
                </div>
              </td>
              <td class="text-center py-3 px-4">
                @if (excedeMontoMaximo(result)) {
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  >
                    ⚠️ Excede
                  </span>
                } @else if (result.winner === 'factoring') {
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    📄 Factoring
                  </span>
                } @else {
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    🏦 Plazo Fijo
                  </span>
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

  getMontoMaximo(opportunity: { target_amount: number; percentage_financed: number }): number {
    return opportunity.target_amount * (1 - opportunity.percentage_financed / 100);
  }

  excedeMontoMaximo(result: ComparisonResult): boolean {
    const maximo = this.getMontoMaximo(result.factoring.opportunity);
    return this.montoInversion() > maximo;
  }
}