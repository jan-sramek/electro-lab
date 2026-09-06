import { Component, computed, effect, ElementRef, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LearnSlideDeck } from '../../data/learn-slides.model';
import { LearnFigureComponent } from '../learn-figure/learn-figure.component';

/**
 * Slide-style lesson: one idea per page, a figure, a few paragraphs, an optional
 * callout. Navigation by buttons, progress dots, ← → keys and horizontal swipe.
 * Emits `lastReached` the first time the learner arrives at the final slide so
 * the unit page can unlock the read confirmation.
 */
@Component({
  selector: 'app-learn-slide-deck',
  standalone: true,
  imports: [TranslatePipe, LearnFigureComponent],
  templateUrl: './learn-slide-deck.component.html',
  styleUrl: './learn-slide-deck.component.css'
})
export class LearnSlideDeckComponent {
  readonly slides = input.required<LearnSlideDeck>();
  /** Zero-based slide to open with (e.g. restored from the URL fragment). */
  readonly startIndex = input(0);
  readonly lastReached = output<void>();
  readonly indexChange = output<number>();

  readonly index = signal(0);
  readonly visited = signal<ReadonlySet<number>>(new Set([0]));
  readonly count = computed(() => this.slides().length);
  readonly current = computed(() => this.slides()[this.index()]);
  readonly isFirst = computed(() => this.index() === 0);
  readonly isLast = computed(() => this.index() >= this.count() - 1);
  readonly progressPct = computed(() => (this.count() ? ((this.index() + 1) / this.count()) * 100 : 0));
  /** Slide transition direction for the enter animation. */
  readonly direction = signal<'forward' | 'back'>('forward');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly card = viewChild<ElementRef<HTMLElement>>('card');
  private swipeStartX: number | null = null;
  private lastEmitted = false;

  constructor() {
    effect(() => {
      // Reset when a different deck is bound (navigating between units).
      const n = this.slides().length;
      const start = Math.max(0, Math.min(n - 1, untracked(() => this.startIndex())));
      this.index.set(start);
      this.visited.set(new Set(Array.from({ length: start + 1 }, (_, i) => i)));
      this.lastEmitted = false;
    });
    effect(() => {
      if (this.isLast() && this.count() > 0 && !this.lastEmitted) {
        this.lastEmitted = true;
        this.lastReached.emit();
      }
    });
  }

  goTo(i: number): void {
    const clamped = Math.max(0, Math.min(this.count() - 1, i));
    if (clamped === this.index()) return;
    this.direction.set(clamped > this.index() ? 'forward' : 'back');
    this.index.set(clamped);
    this.visited.update((v) => new Set([...v, clamped]));
    this.indexChange.emit(clamped);
    // Keep the card in view and focused for keyboard users when paging.
    queueMicrotask(() => this.card()?.nativeElement.focus({ preventScroll: true }));
  }

  next(): void {
    this.goTo(this.index() + 1);
  }

  prev(): void {
    this.goTo(this.index() - 1);
  }

  onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') {
      ev.preventDefault();
      this.next();
    } else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') {
      ev.preventDefault();
      this.prev();
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      this.goTo(0);
    } else if (ev.key === 'End') {
      ev.preventDefault();
      this.goTo(this.count() - 1);
    }
  }

  onPointerDown(ev: PointerEvent): void {
    if (ev.pointerType === 'mouse') return;
    this.swipeStartX = ev.clientX;
  }

  onPointerUp(ev: PointerEvent): void {
    if (this.swipeStartX === null) return;
    const dx = ev.clientX - this.swipeStartX;
    this.swipeStartX = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) this.next();
    else this.prev();
  }

  swipeStartXReset(): void {
    this.swipeStartX = null;
  }

  isVisited(i: number): boolean {
    return this.visited().has(i);
  }

  /** Root element — exposed for tests that dispatch keyboard events. */
  get hostElement(): HTMLElement {
    return this.host.nativeElement;
  }
}
