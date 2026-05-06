import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tool-placeholder-page',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div class="max-w-md mx-auto text-center">
        <span class="text-6xl sm:text-7xl block">🚧</span>
        <h1 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Herramienta en construcción
        </h1>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          La herramienta "<span class="font-semibold text-emerald-600 dark:text-emerald-400">{{
            toolName()
          }}</span
          >" aún no está implementada.
        </p>
        <a
          routerLink="/"
          class="inline-flex mt-6 items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl transition-colors"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolPlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly toolName = toSignal(
    this.route.params.pipe(map((params) => params['id'] || 'Desconocida')),
    { initialValue: 'Desconocida' },
  );
}
