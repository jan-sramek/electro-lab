import { AfterViewChecked, Component, ElementRef, ViewChild, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CircuitSlot } from '../../services/schematic-persistence';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-circuit-tabs',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './circuit-tabs.component.html',
  styleUrl: './circuit-tabs.component.css'
})
export class CircuitTabsComponent implements AfterViewChecked {
  readonly slots = input.required<CircuitSlot[]>();
  readonly activeId = input<string | null>(null);

  readonly activate = output<string>();
  readonly add = output<void>();
  readonly close = output<string>();
  readonly rename = output<{ id: string; name: string }>();

  readonly editingId = signal<string | null>(null);
  readonly draftName = signal('');
  private focusRename = false;

  @ViewChild('renameInput') renameInput?: ElementRef<HTMLInputElement>;

  ngAfterViewChecked(): void {
    if (this.focusRename && this.renameInput) {
      this.renameInput.nativeElement.focus();
      this.renameInput.nativeElement.select();
      this.focusRename = false;
    }
  }

  isActive(id: string): boolean {
    return this.activeId() === id;
  }

  onSelect(id: string): void {
    if (this.editingId()) return;
    if (id !== this.activeId()) this.activate.emit(id);
  }

  onClose(ev: MouseEvent, id: string): void {
    ev.stopPropagation();
    this.close.emit(id);
  }

  startRename(ev: MouseEvent, slot: CircuitSlot): void {
    ev.stopPropagation();
    this.editingId.set(slot.id);
    this.draftName.set(slot.name);
    this.focusRename = true;
  }

  commitRename(): void {
    const id = this.editingId();
    if (!id) return;
    const name = this.draftName().trim();
    this.editingId.set(null);
    if (name) this.rename.emit({ id, name });
  }

  cancelRename(): void {
    this.editingId.set(null);
  }
}
