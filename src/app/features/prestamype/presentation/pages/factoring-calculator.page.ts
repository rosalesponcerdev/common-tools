import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DecimalPipe } from '@angular/common';
import { FactoringCalculatorFacade } from '../facades/factoring-calculator.facade';
import { FactoringComparisonTableComponent } from '../components/factoring-comparison-table.component';

@Component({
  selector: 'app-factoring-calculator-page',
  imports: [FormField, FactoringComparisonTableComponent, DecimalPipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            📄 Calculadora de Factoring
          </h1>
          <p class="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Compara la rentabilidad de invertir en facturas vs plazo fijo
          </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Form -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Input Card -->
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
            >
              <h2 class="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Datos de Entrada
              </h2>

              <div class="space-y-4">
                <!-- JSON Input -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    JSON de Facturas
                  </label>
                  <textarea
                    [formField]="facade.factoringForm.jsonInput"
                    placeholder="Pega el JSON de facturas aquí..."
                    class="w-full h-40 sm:h-48 px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white text-sm font-mono resize-none"
                  ></textarea>
                  @if (facade.opportunities().error) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                      {{ facade.opportunities().error }}
                    </p>
                  }
                  @if (facade.filteredInfo() && facade.filteredInfo()!.count > 0) {
                    <p class="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ {{ facade.filteredInfo()!.count }} facturas en
                      {{ facade.filteredInfo()!.currency }} fueron filtradas
                    </p>
                  }
                </div>

                <!-- Monto de Inversión -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Monto de Inversión (S/)
                  </label>
                  <input
                    type="number"
                    [formField]="facade.factoringForm.montoInversion"
                    step="100"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Este monto se simulará en cada factura PEN individualmente
                  </p>
                  @if (
                    !facade.isMontoValido() && facade.factoringForm.montoInversion().value() > 0
                  ) {
                    <p class="mt-1 text-xs text-red-600 dark:text-red-400">
                      El monto excede el máximo de alguna factura
                    </p>
                  }
                </div>

                <!-- TEA Plazo Fijo -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    TEA Plazo Fijo (%)
                  </label>
                  <input
                    type="number"
                    [formField]="facade.factoringForm.teaPlazoFijo"
                    step="0.1"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ejemplo: 4.5% = 0.045</p>
                </div>
              </div>
            </div>

            <!-- Summary Card -->
            @if (facade.comparacionResultados().length > 0) {
              <div
                class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <h2 class="font-semibold text-lg text-gray-900 dark:text-white mb-4">Resumen</h2>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Facturas procesadas:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ facade.comparacionResultados().length }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Total Factoring:</span>
                    <span class="font-semibold text-emerald-600 dark:text-emerald-400">
                      S/ {{ getTotalFactoring() | number: '1.2-2' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Total Plazo Fijo:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">
                      S/ {{ getTotalPlazoFijo() | number: '1.2-2' }}
                    </span>
                  </div>
                  <div class="pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400">Diferencia:</span>
                      <span
                        class="font-bold"
                        [class.text-emerald-600]="getDiferencia() > 0"
                        [class.dark:text-emerald-400]="getDiferencia() > 0"
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

          <!-- Right Column - Results -->
          <div class="lg:col-span-2">
            @if (facade.comparacionResultados().length > 0) {
              <div
                class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm"
              >
                <!-- Toolbar -->
                <div
                  class="p-3 border-b border-gray-200 dark:border-slate-700 flex flex-wrap items-center gap-3"
                >
                  <!-- Sort -->
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-semibold text-gray-500 dark:text-gray-400"
                      >Ordenar:</label
                    >
                    <select
                      [formField]="facade.factoringForm.sortField"
                      class="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
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
                      class="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                      [title]="
                        facade.factoringForm.sortDirection().value() === 'asc'
                          ? 'Ascendente'
                          : 'Descendente'
                      "
                    >
                      {{ facade.factoringForm.sortDirection().value() === 'asc' ? '↑' : '↓' }}
                    </button>
                  </div>

                  <!-- Group -->
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-semibold text-gray-500 dark:text-gray-400"
                      >Agrupar:</label
                    >
                    <select
                      [formField]="facade.factoringForm.groupField"
                      class="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                    >
                      <option value="type">Tipo</option>
                      <option value="rating">Nivel de confianza</option>
                      <option value="promotion">Promotion</option>
                      <option value="none">Sin agrupar</option>
                    </select>
                  </div>

                  <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                    {{ facade.comparacionResultados().length }} resultados
                  </span>
                </div>

                <!-- Groups -->
                @for (group of facade.groupedResults(); track group.key) {
                  @if (facade.factoringForm.groupField().value() !== 'none') {
                    <div
                      class="px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700"
                    >
                      <span
                        class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
                      >
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
                class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 sm:p-12 text-center shadow-sm"
              >
                <span class="text-5xl block mb-4">📊</span>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Sin datos para comparar
                </h3>
                <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
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
