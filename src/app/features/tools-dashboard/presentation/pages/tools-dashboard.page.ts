import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ToolCategory } from '../../domain';
import { ToolCardComponent } from '../components/tool-card.component';
import { ToolsDashboardFacade } from '../facades/tools-dashboard.facade';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-tools-dashboard-page',
  imports: [ToolCardComponent, FormField],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-start py-12 px-4">
      <div class="w-full max-w-6xl">
        <header class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">🛠️ Mis Herramientas</h1>
          <p class="mt-2 text-zinc-500 dark:text-zinc-400">
            Accede rápidamente a todas tus herramientas de uso diario
          </p>
        </header>

        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <div class="flex-1 relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
            <input
              type="text"
              [formField]="facade.toolsDashboardForm.searchQuery"
              placeholder="Buscar herramientas..."
              class="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
          <select
            [formField]="facade.toolsDashboardForm.category"
            class="px-4 py-3 pr-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            @for (category of facade.categories; track category.value) {
              <option [value]="category.value">{{ category.label }}</option>
            }
          </select>
        </div>

        @if (facade.isLoading()) {
          <div class="text-center py-12">
            <p class="text-zinc-500 dark:text-zinc-400">Cargando...</p>
          </div>
        } @else if (facade.filteredTools().length === 0) {
          <div class="text-center py-12">
            <span class="text-4xl">🔎</span>
            <p class="mt-4 text-zinc-500 dark:text-zinc-400">No se encontraron herramientas</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            @for (tool of facade.filteredTools(); track tool.id) {
              <app-tool-card [tool]="tool" />
            }
          </div>
        }

        <div class="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p class="text-sm text-zinc-400 dark:text-zinc-500 text-center">
            {{ facade.filteredTools().length }} herramienta{{
              facade.filteredTools().length !== 1 ? 's' : ''
            }}
            disponible{{ facade.filteredTools().length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsDashboardPage {
  readonly facade = inject(ToolsDashboardFacade);

  constructor() {
    this.facade.loadTools();
  }
}
