import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchematicComponent } from '../../data/schematic.model';
import { SYMBOL_LIBRARY, ParamDef } from '../../data/symbol-library';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-inspector-panel',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './inspector.component.html',
  styleUrl: './inspector.component.css'
})
export class InspectorPanelComponent {
  readonly selected = input<SchematicComponent | null>(null);
  readonly selectionCount = input(0);
  readonly paramChange = output<{ key: string; value: number | boolean }>();
  readonly rotate = output<void>();
  readonly remove = output<void>();
  readonly replaceLed = output<void>();

  /** In-progress number field text — committed on blur/Enter only (avoids sim on "8" while typing "800"). */
  private readonly numberDrafts = signal<Record<string, number | string>>({});

  constructor() {
    effect(() => {
      this.selected()?.id;
      this.numberDrafts.set({});
    });
  }

  readonly label = computed(() => {
    const c = this.selected();
    return c ? (SYMBOL_LIBRARY[c.modelKey]?.label ?? c.modelKey) : '';
  });

  readonly teachingNote = computed(() => {
    const c = this.selected();
    return c ? (SYMBOL_LIBRARY[c.modelKey]?.teachingNote ?? null) : null;
  });

  readonly ledBurned = computed(() => {
    const c = this.selected();
    return !!c && c.modelKey === 'led' && !!c.params['burned'];
  });

  readonly params = computed((): ParamDef[] => {
    const c = this.selected();
    if (!c) return [];
    return SYMBOL_LIBRARY[c.modelKey]?.paramDefs ?? [];
  });

  numberDisplay(c: SchematicComponent, key: string): number | string {
    const draft = this.numberDrafts()[this.draftKey(c.id, key)];
    if (draft !== undefined) return draft;
    return c.params[key] as number;
  }

  onNumberDraft(componentId: string, key: string, raw: number | string | null): void {
    const dk = this.draftKey(componentId, key);
    this.numberDrafts.update((d) => ({ ...d, [dk]: raw ?? '' }));
  }

  onNumberCommit(componentId: string, key: string): void {
    const dk = this.draftKey(componentId, key);
    const draft = this.numberDrafts()[dk];
    if (draft === undefined) return;
    this.numberDrafts.update((d) => {
      const { [dk]: _, ...rest } = d;
      return rest;
    });
    const value = Number(draft);
    if (!Number.isFinite(value)) return;
    this.paramChange.emit({ key, value });
  }

  onEnum(key: string, value: number): void {
    this.paramChange.emit({ key, value });
  }

  onBool(key: string, value: boolean): void {
    this.paramChange.emit({ key, value: Boolean(value) });
  }

  private draftKey(componentId: string, paramKey: string): string {
    return `${componentId}:${paramKey}`;
  }
}
