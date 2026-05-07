import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComparisonResult } from '../../domain';
import { FactoringComparisonRowComponent } from './factoring-comparison-row.component';

@Component({
  selector: 'app-factoring-comparison-table',
  imports: [FactoringComparisonRowComponent],
  templateUrl: './factoring-comparison-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoringComparisonTableComponent {
  readonly resultados = input.required<ComparisonResult[]>();
  readonly montoInversion = input.required<number>();
  readonly showGroupHeader = input<boolean>(false);
}
