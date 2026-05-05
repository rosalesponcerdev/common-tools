import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DecimalPipe } from '@angular/common';
import { FactoringCalculatorFacade } from '../facades/factoring-calculator.facade';
import { FactoringComparisonTableComponent } from '../components/factoring-comparison-table.component';

@Component({
  selector: 'app-factoring-calculator-page',
  imports: [FormField, FactoringComparisonTableComponent, DecimalPipe],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            📄 Calculadora de Factoring
          </h1>
          <p class="mt-2 text-zinc-500 dark:text-zinc-400">
            Compara la rentabilidad de invertir en facturas vs plazo fijo
          </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 space-y-6">
            <div
              class="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700"
            >
              <h2 class="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Datos de Entrada</h2>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    JSON de Facturas
                  </label>
                  <textarea
                    [formField]="facade.factoringForm.jsonInput"
                    placeholder="Pega el JSON de facturas aquí..."
                    class="w-full h-48 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 text-sm font-mono resize-none"
                  ></textarea>
                  @if (facade.opportunities().error) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                      {{ facade.opportunities().error }}
                    </p>
                  }
                  @if (facade.filteredInfo() && facade.filteredInfo()!.count > 0) {
                    <p class="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ {{ facade.filteredInfo()!.count }} facturas en
                      {{ facade.filteredInfo()!.currency }} fueron filtradas (solo se procesan PEN)
                    </p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Monto de Inversión (S/)
                  </label>
                  <input
                    type="number"
                    [formField]="facade.factoringForm.montoInversion"
                    step="100"
                    class="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Este monto se simulará en cada factura PEN individualmente
                  </p>
                  @if (!facade.isMontoValido() && facade.factoringForm.montoInversion().value() > 0) {
                    <p class="mt-1 text-xs text-red-600 dark:text-red-400">
                      El monto excede el máximo de alguna factura
                    </p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    TEA Plazo Fijo (%)
                  </label>
                  <input
                    type="number"
                    [formField]="facade.factoringForm.teaPlazoFijo"
                    step="0.1"
                    class="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Ejemplo: 4.5% = 0.045</p>
                </div>
              </div>
            </div>

            @if (facade.comparacionResultados().length > 0) {
              <div
                class="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700"
              >
                <h2 class="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Resumen</h2>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-zinc-600 dark:text-zinc-400">Facturas procesadas:</span>
                    <span class="font-medium text-zinc-900 dark:text-zinc-100">
                      {{ facade.comparacionResultados().length }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-600 dark:text-zinc-400">Total Factoring:</span>
                    <span class="font-medium text-green-600 dark:text-green-400">
                      S/ {{ getTotalFactoring() | number: '1.2-2' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-600 dark:text-zinc-400">Total Plazo Fijo:</span>
                    <span class="font-medium text-zinc-900 dark:text-zinc-100">
                      S/ {{ getTotalPlazoFijo() | number: '1.2-2' }}
                    </span>
                  </div>
                  <div class="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <div class="flex justify-between">
                      <span class="text-zinc-600 dark:text-zinc-400">Diferencia:</span>
                      <span
                        class="font-bold"
                        [class.text-green-600]="getDiferencia() > 0"
                        [class.dark:text-green-400]="getDiferencia() > 0"
                        [class.text-red-600]="getDiferencia() < 0"
                        [class.dark:text-red-400]="getDiferencia() < 0"
                      >
                        {{ getDiferencia() > 0 ? '+' : '' }}S/
                        {{ getDiferencia() | number: '1.2-2' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="lg:col-span-2">
            @if (facade.comparacionResultados().length > 0) {
              <div
                class="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <div
                  class="p-3 border-b border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center gap-3"
                >
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      >Ordenar:</label
                    >
                    <select
                      [formField]="facade.factoringForm.sortField"
                      class="text-xs px-2 py-1.5 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="type">Tipo</option>
                      <option value="rating">Nivel de confianza</option>
                      <option value="promotion">Promotion</option>
                      <option value="gananciaFactoring">Ganancia Factoring</option>
                      <option value="gananciaPlazoFijo">Ganancia Plazo Fijo</option>
                      <option value="diferencia">Diferencia</option>
                      <option value="tea">TEA Neta</option>
                      <option value="dias">Días</option>
                    </select>
                    <button
                      (click)="toggleSortDirection()"
                      class="text-xs px-2 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      [title]="facade.factoringForm.sortDirection().value() === 'asc' ? 'Ascendente' : 'Descendente'"
                    >
                      {{ facade.factoringForm.sortDirection().value() === 'asc' ? '↑' : '↓' }}
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                      >Agrupar:</label
                    >
                    <select
                      [formField]="facade.factoringForm.groupField"
                      class="text-xs px-2 py-1.5 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="type">Tipo</option>
                      <option value="rating">Nivel de confianza</option>
                      <option value="promotion">Promotion</option>
                      <option value="none">Sin agrupar</option>
                    </select>
                  </div>
                  <span class="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                    {{ facade.comparacionResultados().length }} resultados
                  </span>
                </div>
                @for (group of facade.groupedResults(); track group.key) {
                  @if (facade.factoringForm.groupField().value() !== 'none') {
                    <div
                      class="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700"
                    >
                      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {{ group.label }}
                      </span>
                    </div>
                  }
                  <app-factoring-comparison-table
                    [resultados]="group.results"
                    [montoInversion]="facade.factoringForm.montoInversion().value()"
                    [showGroupHeader]="false"
                  />
                }
              </div>
            } @else {
              <div
                class="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-12 text-center"
              >
                <span class="text-4xl">📊</span>
                <h3 class="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Sin datos para comparar
                </h3>
                <p class="mt-2 text-zinc-500 dark:text-zinc-400">
                  Ingresa las facturas en formato JSON y el monto de inversión para ver la
                  comparación
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoringCalculatorPage {
  readonly facade = inject(FactoringCalculatorFacade);

  toggleSortDirection(): void {
    this.facade.toggleSortDirection();
  }

  getTotalFactoring(): number {
    return this.facade
      .comparacionResultados()
      .reduce((sum, r) => sum + r.factoring.gananciaNeta, 0);
  }

  getTotalPlazoFijo(): number {
    return this.facade
      .comparacionResultados()
      .reduce((sum, r) => sum + r.plazoFijo.gananciaNeta, 0);
  }

  getDiferencia(): number {
    return this.getTotalFactoring() - this.getTotalPlazoFijo();
  }
}
