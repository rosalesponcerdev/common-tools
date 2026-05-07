import { CommonModule } from '@angular/common';
import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExchangeRate } from '../../application/exchange-rate';

@Component({
  selector: 'app-exchange-rate-settings',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exchange-rate-settings.component.html',
  styleUrl: './exchange-rate-settings.component.css',
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
