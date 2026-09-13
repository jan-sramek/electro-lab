import { Component, computed, inject, input, output, signal } from '@angular/core';
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

export type PaletteScope = 'exercise' | 'all';

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
  readonly glyphKeyOf = glyphKeyOf;
  readonly place = output<string>();

  /** When set, the exercise/all toggle is shown and filtering can apply. */
  readonly exerciseKeys = input<readonly string[] | null>(null);
  /** Parent-controlled scope; ignored when there are no exercise keys. */
  readonly scope = input<PaletteScope>('all');
  readonly scopeChange = output<PaletteScope>();

  readonly visibleGroups = computed(() => {
    const allowed = this.effectiveAllowed();
    return PALETTE_GROUPS.map((g) => ({
      ...g,
      keys: allowed ? g.keys.filter((k) => allowed.has(k)) : [...g.keys]
    })).filter((g) => g.keys.length > 0);
  });

  readonly showScopeToggle = computed(() => (this.exerciseKeys()?.length ?? 0) > 0);

  /** Multi-open accordion; Sources + Passives start expanded. */
  private readonly openIds = signal<Set<string>>(new Set(['sources', 'passives']));

  private effectiveAllowed(): Set<string> | null {
    const keys = this.exerciseKeys();
    if (!keys?.length || this.scope() === 'all') return null;
    return new Set(keys);
  }

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

  setScope(next: PaletteScope): void {
    if (next === this.scope()) return;
    this.scopeChange.emit(next);
    if (next === 'exercise') {
      const allowed = new Set(this.exerciseKeys() ?? []);
      this.openIds.set(
        new Set(PALETTE_GROUPS.filter((g) => g.keys.some((k) => allowed.has(k))).map((g) => g.id))
      );
    }
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
