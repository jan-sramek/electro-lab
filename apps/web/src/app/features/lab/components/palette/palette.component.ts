import { Component, output } from '@angular/core';
import { PALETTE_ORDER, SYMBOL_LIBRARY } from '../../data/symbol-library';
import { PALETTE_DRAG_MIME } from '../../data/palette-drag';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SymbolGlyphComponent } from '../symbol-glyph/symbol-glyph.component';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [TranslatePipe, SymbolGlyphComponent],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css'
})
export class ComponentPaletteComponent {
  readonly lib = SYMBOL_LIBRARY;
  readonly keys = [...PALETTE_ORDER];
  readonly place = output<string>();

  onDragStart(ev: DragEvent, modelKey: string): void {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.setData(PALETTE_DRAG_MIME, modelKey);
    ev.dataTransfer.setData('text/plain', modelKey);
    ev.dataTransfer.effectAllowed = 'copy';
  }
}
