import { Component, computed, input, output } from '@angular/core';
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

  readonly label = computed(() => {
    const c = this.selected();
    return c ? (SYMBOL_LIBRARY[c.modelKey]?.label ?? c.modelKey) : '';
  });

  readonly params = computed((): ParamDef[] => {
    const c = this.selected();
    if (!c) return [];
    return SYMBOL_LIBRARY[c.modelKey]?.paramDefs ?? [];
  });

  onNumber(key: string, raw: number | string | null): void {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    this.paramChange.emit({ key, value });
  }

  onBool(key: string, value: boolean): void {
    this.paramChange.emit({ key, value: Boolean(value) });
  }
}
