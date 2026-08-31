import { AfterViewChecked, Component, ElementRef, HostListener, ViewChild, input, output, signal } from '@angular/core';
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
  readonly togglePin = output<string>();
  readonly closeOthers = output<void>();
  readonly closeUnpinned = output<void>();

  readonly editingId = signal<string | null>(null);
  readonly draftName = signal('');
  readonly menuOpen = signal(false);
  /** When set, menu actions apply to this tab (context menu); otherwise bar menu. */
  readonly menuTab = signal<CircuitSlot | null>(null);
  private focusRename = false;

  @ViewChild('renameInput') renameInput?: ElementRef<HTMLInputElement>;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.dismissMenu();
  }

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

  isActivePinned(): boolean {
    const id = this.activeId();
    if (!id) return false;
    return !!this.slots().find((s) => s.id === id)?.pinned;
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
    this.dismissMenu();
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

  toggleBarMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    if (this.menuOpen() && !this.menuTab()) {
      this.dismissMenu();
      return;
    }
    this.menuTab.set(null);
    this.menuOpen.set(true);
  }

  onTabContextMenu(ev: MouseEvent, slot: CircuitSlot): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.menuTab.set(slot);
    this.menuOpen.set(true);
  }

  dismissMenu(): void {
    this.menuOpen.set(false);
    this.menuTab.set(null);
  }

  canCloseOthers(): boolean {
    const id = this.activeId();
    if (!id) return false;
    return this.slots().some((s) => !s.pinned && s.id !== id);
  }

  canCloseUnpinned(): boolean {
    const unpinned = this.slots().filter((s) => !s.pinned);
    if (!unpinned.length) return false;
    // Need something left after (pinned exist, or more than one unpinned survivor rule).
    const pinned = this.slots().filter((s) => s.pinned);
    return pinned.length > 0 || unpinned.length > 1;
  }

  emitTogglePin(id: string): void {
    this.togglePin.emit(id);
    this.dismissMenu();
  }

  emitCloseOthers(): void {
    this.closeOthers.emit();
    this.dismissMenu();
  }

  emitCloseUnpinned(): void {
    this.closeUnpinned.emit();
    this.dismissMenu();
  }
}
