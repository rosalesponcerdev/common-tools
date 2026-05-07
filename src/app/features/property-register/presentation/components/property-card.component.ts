import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyStatus } from '../../domain/property-status.value-object';
import { PropertyType } from '../../domain/property-type.value-object';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group relative bg-app-surface dark:bg-app-dark-surface rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      @if (mapsUrl()) {
        <div class="h-40 overflow-hidden">
          <iframe
            [src]="sanitizedMapsUrl()"
            class="w-full h-full border-0 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            title="Ubicación en mapa"
          ></iframe>
        </div>
      } @else {
        <div
          class="h-40 bg-gradient-to-br from-gray-100 dark:from-slate-700 to-gray-200 dark:to-slate-800 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      }

      <div class="p-4">
        <div class="flex items-start justify-between mb-3">
          <div class="flex gap-2">
            <span class="px-2.5 py-1 text-xs font-medium rounded-full" [class]="typeClass()">
              {{ propertyTypeLabel() }}
            </span>
            <span class="px-2.5 py-1 text-xs font-medium rounded-full" [class]="statusClass()">
              {{ statusLabel() }}
            </span>
          </div>
          @if (isNew()) {
            <span
              class="px-2 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full"
            >
              NUEVO
            </span>
          }
        </div>

        <h3 class="font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {{ district() }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
          {{ street() }}
        </p>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Área</p>
            <p class="font-medium text-gray-700 dark:text-gray-300">{{ area() }} m²</p>
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">
              Precio/m²
            </p>
            <p class="font-medium text-emerald-600 dark:text-emerald-400">
              {{ pricePerSqmFormatted() }}
            </p>
          </div>
        </div>

        @if (constructionYear()) {
          <div class="mt-2 text-sm">
            <p class="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Año</p>
            <p class="font-medium text-gray-700 dark:text-gray-300">
              {{ constructionYear() }}
            </p>
          </div>
        }

        <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ priceUsdFormatted() }}
            @if (originalCurrency() === 'USD') {
              <span
                class="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded"
              >
                TC
              </span>
            }
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ pricePen() | number: '1.2-2' }} PEN)
            </span>
          </p>
        </div>

        @if (description()) {
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {{ description() }}
          </p>
        }
      </div>
    </article>
  `,
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
