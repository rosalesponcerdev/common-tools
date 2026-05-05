import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ToolCardComponent } from '../components/tool-card.component';
import { ToolsDashboardFacade } from '../facades/tools-dashboard.facade';

@Component({
  selector: 'app-tools-dashboard-page',
  imports: [ToolCardComponent, FormField],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-start py-10 sm:py-12 px-4">
      <div class="w-full max-w-6xl">
        <!-- Header -->
        <header class="mb-8 text-center">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">🛠️ Mis Herramientas</h1>
          <p class="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Accede rápidamente a todas tus herramientas de uso diario
          </p>
        </header>

        <!-- Search and Filter -->
        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <div class="flex-1 relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">🔍</span>
            <input
              type="text"
              [formField]="facade.toolsDashboardForm.searchQuery"
              placeholder="Buscar herramientas..."
              class="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div class="flex-1 sm:flex-none relative">
            <select
              [formField]="facade.toolsDashboardForm.category"
              class="w-full sm:w-48 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors appearance-none"
            >
              @for (category of facade.categories; track category.value) {
                <option [value]="category.value" class="dark:bg-slate-800">{{ category.label }}</option>
              }
            </select>
            <!-- Custom arrow -->
            <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Loading -->
        @if (facade.isLoading()) {
          <div class="text-center py-12">
            <div class="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Cargando...</p>
          </div>

        <!-- Empty State -->
        } @else if (facade.filteredTools().length === 0) {
          <div class="text-center py-12">
            <span class="text-5xl block mb-4">🔎</span>
            <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">No se encontraron herramientas</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Intenta con otros criterios de búsqueda</p>
          </div>

        <!-- Tools Grid -->
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            @for (tool of facade.filteredTools(); track tool.id) {
              <app-tool-card [tool]="tool" />
            }
          </div>
        }

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            {{ facade.filteredTools().length }} herramienta{{
              facade.filteredTools().length !== 1 ? 's' : ''
            }}
            disponible{{ facade.filteredTools().length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 0.8s linear infinite;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsDashboardPage {
  readonly facade = inject(ToolsDashboardFacade);

  constructor() {
    this.facade.loadTools();
  }
}