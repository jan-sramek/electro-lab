import { Component, output } from '@angular/core';
import { PALETTE_ORDER, SYMBOL_LIBRARY } from '../../data/symbol-library';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css'
})
export class ComponentPaletteComponent {
  readonly lib = SYMBOL_LIBRARY;
  readonly keys = [...PALETTE_ORDER];
  readonly place = output<string>();
}
