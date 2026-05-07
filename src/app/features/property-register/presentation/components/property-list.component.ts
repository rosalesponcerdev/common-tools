import { CommonModule } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy, effect } from '@angular/core';
import { PropertyResponse } from '../../application/dtos/property-response.dto';
import { PropertyCardComponent } from './property-card.component';

@Component({
  selector: 'app-property-list',
  imports: [CommonModule, PropertyCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css',
})
export class PropertyListComponent {
  readonly properties = input.required<PropertyResponse[]>();
  readonly deleteProperty = output<string>();
}
