import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyRegisterFacade } from '../property-register.facade';
import {
  PropertyFilterComponent,
  PropertyFormComponent,
  PropertyListComponent,
  ExchangeRateSettingsComponent,
} from '../components';

@Component({
  selector: 'app-property-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    PropertyFilterComponent,
    PropertyFormComponent,
    PropertyListComponent,
    ExchangeRateSettingsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-dashboard.page.html',
  styleUrl: './property-dashboard.page.css',
  host: {
    class: 'block',
  },
})
export class PropertyDashboardPage {
  readonly facade = inject(PropertyRegisterFacade);
  readonly showForm = signal(false);

  readonly avgPricePerSqmFormatted = computed(() => {
    return '$' + this.facade.stats().avgPricePerSqm.toFixed(2);
  });

  readonly avgAreaFormatted = computed(() => {
    return this.facade.stats().avgArea.toFixed(0) + ' m²';
  });

  onCreateProperty(request: any) {
    this.facade.createProperty(request);
    this.showForm.set(false);
  }
}
