import { Component, ChangeDetectionStrategy, output, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnitOfMeasure } from '../domain';

export interface PresentationFormOutput {
  brand: string;
  quantity: number;
  unit: UnitOfMeasure;
  price: number;
}

@Component({
  selector: 'app-presentation-form',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './presentation-form.component.html',
  styleUrl: './presentation-form.component.css',
})
export class PresentationFormComponent {
  readonly add = output<PresentationFormOutput>();

  readonly brandInput = viewChild.required<ElementRef<HTMLInputElement>>('brandInput');

  brand = '';
  quantity: number | null = null;
  unit: UnitOfMeasure = 'gr';
  price: number | null = null;

  submit(): void {
    if (
      !this.brand.trim() ||
      !this.quantity ||
      this.quantity <= 0 ||
      !this.price ||
      this.price <= 0
    ) {
      return;
    }

    this.add.emit({
      brand: this.brand,
      quantity: this.quantity,
      unit: this.unit,
      price: this.price,
    });

    this.brand = '';
    this.quantity = null;
    this.unit = 'gr';
    this.price = null;

    setTimeout(() => {
      this.brandInput().nativeElement.focus();
    }, 0);
  }
}
