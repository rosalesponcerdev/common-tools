import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool } from '../../domain';

@Component({
  selector: 'app-tool-card',
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="tool().route"
      class="group flex flex-col h-full p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all duration-300 cursor-pointer"
    >
      <div class="flex items-start gap-4">
        <span class="text-3xl">{{ tool().icon }}</span>
        <div class="flex-1 min-w-0">
          <h3
            class="font-semibold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            {{ tool().name }}
          </h3>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {{ tool().description }}
          </p>
        </div>
      </div>
      <div class="mt-auto pt-4 flex items-center justify-between">
        <span
          class="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
        >
          {{ tool().category }}
        </span>
        <span
          class="text-zinc-400 dark:text-zinc-500 group-hover:translate-x-1 transition-transform"
        >
          →
        </span>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolCardComponent {
  readonly tool = input.required<Tool>();
}
