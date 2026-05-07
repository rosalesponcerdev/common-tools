import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DecimalPipe } from '@angular/common';
import { FactoringCalculatorFacade } from '../facades/factoring-calculator.facade';
import { FactoringComparisonTableComponent } from '../components/factoring-comparison-table.component';

@Component({
  selector: 'app-factoring-calculator-page',
  imports: [FormField, FactoringComparisonTableComponent, DecimalPipe],
  templateUrl: './factoring-calculator.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactoringCalculatorPage {
  readonly facade = inject(FactoringCalculatorFacade);

  toggleSortDirection(): void {
    this.facade.toggleSortDirection();
  }

  getTotalFactoring(): number {
    return this.facade
      .comparacionResultados()
      .reduce((sum, r) => sum + r.factoring.gananciaNeta, 0);
  }

  getTotalPlazoFijo(): number {
    return this.facade
      .comparacionResultados()
      .reduce((sum, r) => sum + r.plazoFijo.gananciaNeta, 0);
  }

  getDiferencia(): number {
    return this.getTotalFactoring() - this.getTotalPlazoFijo();
  }
}
