import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyStatus } from '../../domain/property-status.value-object';
import { PropertyType } from '../../domain/property-type.value-object';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.css',
  host: {
    class: 'block',
  },
})
export class PropertyCardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly type = input.required<PropertyType>();
  readonly status = input.required<PropertyStatus>();
  readonly area = input.required<number>();
  readonly pricePen = input.required<number>();
  readonly priceUsd = input.required<number>();
  readonly pricePerSqmUsd = input.required<number>();
  readonly originalCurrency = input.required<'PEN' | 'USD'>();
  readonly district = input.required<string>();
  readonly street = input.required<string>();
  readonly mapsUrl = input<string>('');
  readonly constructionYear = input<number>(0);
  readonly description = input<string>('');
  readonly isNew = input<boolean>(false);

  readonly propertyTypeLabel = computed(() => {
    const labels: Record<PropertyType, string> = {
      terreno: 'Terreno',
      casa: 'Casa',
      departamento: 'Departamento',
    };
    return labels[this.type()];
  });

  readonly statusLabel = computed(() => {
    const labels: Record<PropertyStatus, string> = {
      disponible: 'Disponible',
      apartada: 'Apartada',
      vendida: 'Vendida',
    };
    return labels[this.status()];
  });

  readonly pricePerSqmFormatted = computed(() => {
    return '$' + this.pricePerSqmUsd().toFixed(2);
  });

  readonly priceUsdFormatted = computed(() => {
    return '$' + this.priceUsd().toFixed(2);
  });

  readonly sanitizedMapsUrl = computed((): SafeResourceUrl => {
    const url = this.mapsUrl();
    if (!url) return '';
    const embedUrl = url.replace('/edit?', '/embed?');
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  });

  readonly typeClass = computed(() => {
    switch (this.type()) {
      case 'terreno':
        return 'bg-amber-100 text-amber-700';
      case 'casa':
        return 'bg-blue-100 text-blue-700';
      case 'departamento':
        return 'bg-violet-100 text-violet-700';
    }
  });

  readonly statusClass = computed(() => {
    switch (this.status()) {
      case 'disponible':
        return 'bg-emerald-100 text-emerald-700';
      case 'apartada':
        return 'bg-amber-100 text-amber-700';
      case 'vendida':
        return 'bg-gray-100 text-gray-600';
    }
  });
}
