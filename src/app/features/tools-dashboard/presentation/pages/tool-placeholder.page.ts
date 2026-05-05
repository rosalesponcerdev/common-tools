import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tool-placeholder-page',
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto text-center py-12">
      <span class="text-6xl">🚧</span>
      <h1 class="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Herramienta en construcción
      </h1>
      <p class="mt-4 text-zinc-500 dark:text-zinc-400">
        La herramienta "<span class="font-medium">{{ toolName() }}</span>" aún no está implementada. ¡Tú puedes crearla!
      </p>
      <a
        routerLink="/"
        class="inline-flex mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
      >
        ← Volver al Dashboard
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolPlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly toolName = toSignal(
    this.route.params.pipe(map((params) => params['id'] || 'Desconocida')),
    { initialValue: 'Desconocida' }
  );
}