import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { ToolCardComponent } from '../components/tool-card.component';
import { ToolsDashboardFacade } from '../facades/tools-dashboard.facade';

@Component({
  selector: 'app-tools-dashboard-page',
  imports: [ToolCardComponent, FormField],
  templateUrl: './tools-dashboard.page.html',
  styleUrl: './tools-dashboard.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsDashboardPage {
  readonly facade = inject(ToolsDashboardFacade);

  constructor() {
    this.facade.loadTools();
  }
}
