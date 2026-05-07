import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool } from '../../domain';

@Component({
  selector: 'app-tool-card',
  imports: [RouterLink],
  templateUrl: './tool-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolCardComponent {
  readonly tool = input.required<Tool>();
}
