import { Component, inject, output, signal } from '@angular/core';
import {
  PALETTE_GROUPS,
  SYMBOL_LIBRARY,
  SymbolDef,
  glyphKeyOf
} from '../../data/symbol-library';
import { PALETTE_DRAG_MIME } from '../../data/palette-drag';
import { normalizeLedColorId } from '../../data/led-colors';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { SymbolGlyphComponent } from '../symbol-glyph/symbol-glyph.component';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [TranslatePipe, SymbolGlyphComponent],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css'
})
export class ComponentPaletteComponent {
  private readonly i18n = inject(I18nService);

  readonly lib = SYMBOL_LIBRARY;
  readonly groups = PALETTE_GROUPS;
  readonly glyphKeyOf = glyphKeyOf;
  readonly place = output<string>();

  /** Multi-open accordion; Sources + Passives start expanded. */
  private readonly openIds = signal<Set<string>>(new Set(['sources', 'passives']));

  isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  toggleGroup(id: string): void {
    this.openIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  partTitle(key: string): string {
    const def = this.lib[key];
    if (!def) return key;
    const name = this.i18n.t(def.label);
    if (!def.teachingNote) return name;
    return `${name} — ${this.i18n.t(def.teachingNote)}`;
  }

  onDragStart(ev: DragEvent, modelKey: string): void {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.setData(PALETTE_DRAG_MIME, modelKey);
    ev.dataTransfer.setData('text/plain', modelKey);
    ev.dataTransfer.effectAllowed = 'copy';
  }

  ledThumbColor(def: SymbolDef): number {
    if (def.modelKey !== 'led') return 0;
    return normalizeLedColorId(def.defaultParams['color']);
  }
}
