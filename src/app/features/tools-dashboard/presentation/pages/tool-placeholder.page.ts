import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tool-placeholder-page',
  imports: [RouterLink],
  templateUrl: './tool-placeholder.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolPlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly toolName = toSignal(
    this.route.params.pipe(map((params) => params['id'] || 'Desconocida')),
    { initialValue: 'Desconocida' },
  );
}
