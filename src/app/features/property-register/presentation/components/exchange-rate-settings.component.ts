import { CommonModule } from '@angular/common';
import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExchangeRate } from '../../application/exchange-rate';

@Component({
  selector: 'app-exchange-rate-settings',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">TC:</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">S/</span>
          <input
            type="number"
            [(ngModel)]="exchangeRateValue"
            (blur)="onRateChange()"
            (keyup.enter)="onRateChange()"
            min="0.01"
            step="0.01"
            class="w-20 pl-8 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>
      <button
        type="button"
        (click)="showAdvanced.set(!showAdvanced())"
        class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        {{ showAdvanced() ? 'Ocultar' : 'Compra/Venta' }}
      </button>
    </div>

    @if (showAdvanced()) {
      <div class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-20 min-w-[200px]">
        <p class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Cambio</p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Compra</label>
            <div class="relative">
              <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/</span>
              <input
                type="number"
                [(ngModel)]="buyRateValue"
                (blur)="onFullRateChange()"
                (keyup.enter)="onFullRateChange()"
                step="0.01"
                class="w-full pl-6 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Venta</label>
            <div class="relative">
              <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/</span>
              <input
                type="number"
                [(ngModel)]="sellRateValue"
                (blur)="onFullRateChange()"
                (keyup.enter)="onFullRateChange()"
                step="0.01"
                class="w-full pl-6 pr-2 py-1.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Actualizado: {{ lastUpdated() | date: 'dd/MM/yy HH:mm' }}
        </p>
      </div>
    }
  `,
  styles: [`
    :host { position: relative; }
  `]
})
export class ExchangeRateSettingsComponent {
  readonly exchangeRate = input.required<ExchangeRate>();
  readonly updateRate = output<number>();
  readonly updateRateFull = output<{ buy: number; sell: number }>();

  exchangeRateValue: number = 3.7;
  buyRateValue: number = 3.65;
  sellRateValue: number = 3.75;
  showAdvanced = signal(false);

  readonly lastUpdated = () => {
    const date = this.exchangeRate().updatedAt;
    return date ? new Date(date) : new Date();
  };

  ngOnChanges() {
    const rate = this.exchangeRate();
    this.exchangeRateValue = rate.value;
    this.buyRateValue = rate.buyRate;
    this.sellRateValue = rate.sellRate;
  }

  onRateChange() {
    if (this.exchangeRateValue > 0) {
      this.updateRate.emit(this.exchangeRateValue);
    }
  }

  onFullRateChange() {
    if (this.buyRateValue > 0 && this.sellRateValue > 0) {
      this.updateRateFull.emit({ buy: this.buyRateValue, sell: this.sellRateValue });
    }
  }
}
