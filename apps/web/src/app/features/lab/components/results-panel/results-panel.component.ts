import { Component, input } from '@angular/core';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { SimulateResponse } from '../../api/circuit-api.types';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [DecimalPipe, KeyValuePipe, TranslatePipe],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css'
})
export class ResultsPanelComponent {
  readonly result = input<SimulateResponse | null>(null);
}
