import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ToolCardComponent } from '../components/tool-card.component';
import { ToolsDashboardFacade } from '../facades/tools-dashboard.facade';

@Component({
  selector: 'app-tools-dashboard-page',
  imports: [ToolCardComponent, FormField],
  styles: [
    `
      .select-wrapper {
        position: relative;
        display: inline-block;
      }
      .select-wrapper select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding: 12px 40px 12px 16px;
        font-size: 16px;
      }
      .select-wrapper::after {
        content: '';
        position: absolute;
        right: 14px;
        top: 50%;
        pointer-events: none;
        width: 8px;
        height: 8px;
        border-right: 2px solid #71717a;
        border-bottom: 2px solid #71717a;
        transform: translateY(-50%) rotate(45deg);
      }
      :host-context(.dark) .select-wrapper::after {
        border-right-color: #a1a1aa;
        border-bottom-color: #a1a1aa;
      }
      .select-styles {
        width: 100%;
        background: white;
        border: 1px solid #e4e4e7;
        border-radius: 0.75rem;
        cursor: pointer;
        color: #18181b;
      }
      :host-context(.dark) .select-styles {
        background: #27272a;
        border-color: #3f3f46;
        color: #f4f4f5;
      }
      .select-styles:focus {
        outline: none;
        ring: 2px solid #6366f1;
        border-color: transparent;
      }
    `,
  ],
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
          <div class="select-wrapper flex-1 sm:flex-none relative">
            <select [formField]="facade.toolsDashboardForm.category" class="select-styles">
              @for (category of facade.categories; track category.value) {
                <option [value]="category.value">{{ category.label }}</option>
              }
            </select>
          </div>
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
