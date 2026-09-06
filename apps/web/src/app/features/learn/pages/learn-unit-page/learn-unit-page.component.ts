import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LearningApiClient } from '../../api/learning-api.client';
import {
  LearnUnitDetailResponse,
  LearnUnitPhase,
  QuizQuestionResultDto,
  resolveUnitPhase
} from '../../api/learning-api.types';
import { unitHasLab } from '../../data/learn-catalog.model';
import { LEARN_POINTS, unitPointsEarned, unitPointsMax } from '../../data/learn-points';
import { learnUnitPath } from '../../data/learn-catalog.model';
import { LearnAnalyticsService } from '../../services/learn-analytics.service';
import { LearnCatalogService } from '../../services/learn-catalog.service';
import { LearnProgressService } from '../../services/learn-progress.service';
import { LearnSeoService } from '../../services/learn-seo.service';
import { findLearnUnit } from '../../data/learn-catalog';
import { specCriteriaForCheck } from '../../data/learn-challenge-spec';
import { firstValueFrom } from 'rxjs';
import { gradeQuizLocally } from '../../data/learn-quiz-grading';
import { isApiUnreachable } from '../../services/learn-api-errors';
import { learnSlideDeckFor } from '../../data/learn-slides-content';
import { LearnSlideDeckComponent } from '../../components/learn-slide-deck/learn-slide-deck.component';
import { CriterionLabelPipe } from '../../data/learn-criterion-label.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { learnStepKey } from '../../data/learn-catalog.model';

@Component({
  selector: 'app-learn-unit-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, LearnSlideDeckComponent, CriterionLabelPipe],
  template: `
    @if (unit(); as u) {
      <article class="learn-unit" [class.wide]="!!slideDeck()">
        <p class="back">
          <a routerLink="/learn">{{ 'learn.unit.backToHub' | t }}</a>
        </p>

        <header class="unit-header">
          <h1>{{ u.i18nKeyPrefix + '.title' | t }}</h1>
          <p class="summary">{{ u.i18nKeyPrefix + '.summary' | t }}</p>
          @if (isLocked(u)) {
            <p class="locked" role="note">{{ 'learn.unit.locked' | t }}</p>
          } @else {
            <nav class="phase-nav" aria-label="Unit progress">
              <span [class.active]="phase() === 'read'">
                {{ 'learn.unit.phase.read' | t }} <b>{{ 'learn.points.plus' | t: { pts: points.read } }}</b>
              </span>
              <span [class.active]="phase() === 'quiz'">
                {{ 'learn.unit.phase.quiz' | t }} <b>{{ 'learn.points.plus' | t: { pts: points.quiz } }}</b>
              </span>
              @if (hasLab()) {
                <span [class.active]="phase() === 'lab'" class="bonus">
                  {{ 'learn.unit.phase.lab' | t }} <b>{{ 'learn.points.bonus' | t: { pts: points.lab } }}</b>
                </span>
              }
              <span [class.active]="phase() === 'complete'">{{ 'learn.unit.phase.done' | t }}</span>
              <span class="points-earned">{{ 'learn.points.unit' | t: { earned: pointsEarned(), max: pointsMax() } }}</span>
            </nav>
          }
          @if (progress.savedLocally()) {
            <p class="notice offline" role="status">{{ 'learn.unit.offlineSaved' | t }}</p>
          }
        </header>

        @if (phase() === 'read') {
          <section class="panel">
            <h2>{{ 'learn.unit.readHeading' | t }}</h2>
            @if (slideDeck(); as deck) {
              <app-learn-slide-deck
                [slides]="deck"
                [startIndex]="startSlide()"
                (lastReached)="onDeckFinished()"
                (indexChange)="onSlideChange($event)"
              />
              @if (!isLocked(u) && !deckFinished()) {
                <p class="hint small">{{ 'learn.unit.readSlidesHint' | t }}</p>
              }
            } @else {
              @for (block of u.lessonBlocks; track block.id) {
                <div class="lesson-block">
                  @if (block.titleKey) {
                    <h3>{{ block.titleKey | t }}</h3>
                  }
                  <p>{{ block.bodyKey | t }}</p>
                </div>
              }
            }
            @if (isLocked(u)) {
              <a class="cta secondary" routerLink="/learn">{{ 'learn.unit.backToHub' | t }}</a>
            } @else if (!slideDeck() || deckFinished()) {
              <label class="read-confirm">
                <input type="checkbox" [checked]="readConfirmed()" (change)="onReadConfirm($event)" />
                <span>{{ 'learn.unit.readConfirm' | t }}</span>
              </label>
              <button class="cta" type="button" [disabled]="!readConfirmed()" (click)="continueToQuiz()">
                {{ 'learn.unit.continueToQuiz' | t }}
              </button>
            }
          </section>
        }

        @if (phase() === 'quiz') {
          <section class="panel">
            <h2>{{ 'learn.unit.quizHeading' | t }}</h2>
            <p class="hint">{{ 'learn.unit.quizHint' | t }}</p>
            @for (q of u.quiz.questions; track q.id) {
              <fieldset class="quiz-q" [class.correct]="quizResult(q.id) === true" [class.wrong]="quizResult(q.id) === false">
                <legend>{{ q.promptKey | t }}</legend>
                @for (opt of q.options; track opt.id) {
                  <label class="quiz-opt">
                    <input
                      type="radio"
                      [name]="'q' + q.id"
                      [value]="opt.id"
                      [checked]="answers()[q.id] === opt.id"
                      (change)="setAnswer(q.id, opt.id)"
                    />
                    <span>{{ opt.labelKey | t }}</span>
                  </label>
                }
                @if (quizFeedback(q.id); as fb) {
                  <p class="quiz-feedback" [class.ok]="fb.correct">{{ fb.explanationKey | t }}</p>
                }
              </fieldset>
            }
            @if (quizRejected()) {
              <p class="notice rejected" role="alert">{{ 'learn.unit.quizRejected' | t }}</p>
            }
            <button class="cta" type="button" [disabled]="!canSubmitQuiz()" (click)="submitQuiz()">
              {{ quizSubmitted() ? ('learn.unit.retryQuiz' | t) : ('learn.unit.submitQuiz' | t) }}
            </button>
            @if (quizPassed()) {
              <button class="cta secondary" type="button" (click)="goToLab()">
                {{ 'learn.unit.continueToLab' | t }}
              </button>
            }
          </section>
        }

        @if (phase() === 'lab') {
          <section class="panel">
            <h2>{{ 'learn.unit.labOptionalHeading' | t }}</h2>
            <p class="notice done" role="status">{{ 'learn.unit.labOptionalUnlocked' | t }}</p>
            <p class="hint">{{ 'learn.unit.labOptionalHint' | t: { pts: points.lab } }}</p>
            <div class="task-brief">
              <h3>{{ 'learn.unit.labGoalHeading' | t }}</h3>
              <p>{{ labGoal(u) }}</p>
            </div>
            @if (labSteps(u).length) {
              <details class="task-steps">
                <summary>{{ 'learn.unit.labStepsHeading' | t }}</summary>
                <ol>
                  @for (k of labSteps(u); track k) {
                    <li>{{ k | t }}</li>
                  }
                </ol>
              </details>
            }
            <h3 class="checks-heading">{{ 'learn.unit.labChecksHeading' | t }}</h3>
            <ul class="criteria">
              @for (c of labChallengeCriteria(u); track c.id) {
                <li>{{ c | criterionLabel }}</li>
              }
            </ul>
            <a
              class="cta"
              routerLink="/lab"
              [queryParams]="labQueryParams(u)"
              (click)="onOpenLab(u)"
            >
              {{ u.i18nKeyPrefix + '.openLab' | t }}
            </a>
            @if (u.nextModuleSlug && u.nextUnitSlug) {
              <a class="cta secondary" [routerLink]="['/learn', u.nextModuleSlug, u.nextUnitSlug]">
                {{ 'learn.unit.skipLab' | t }}
              </a>
            } @else {
              <a class="cta secondary" routerLink="/learn">{{ 'learn.unit.backToHub' | t }}</a>
            }
            <p class="hint small">{{ 'learn.unit.labReturnHint' | t }}</p>
          </section>
        }

        @if (phase() === 'complete') {
          <section class="panel complete">
            <h2>{{ 'learn.unit.completeHeading' | t }}</h2>
            <p>{{ (hasLab() ? 'learn.unit.completeBody' : 'learn.unit.completeBodyNoLab') | t }}</p>
            <p class="hint">{{ 'learn.points.unit' | t: { earned: pointsEarned(), max: pointsMax() } }}</p>
            @if (!hasLab()) {
              <a class="cta secondary" routerLink="/lab" [queryParams]="{ example: u.exampleId }">
                {{ 'learn.unit.exploreLab' | t }}
              </a>
            }
            @if (u.nextModuleSlug && u.nextUnitSlug) {
              <a
                class="cta"
                [routerLink]="['/learn', u.nextModuleSlug, u.nextUnitSlug]"
              >
                {{ 'learn.unit.continueNext' | t }}
              </a>
            } @else {
              <a class="cta" routerLink="/learn">{{ 'learn.unit.backToHub' | t }}</a>
            }
          </section>
        }
      </article>
    }
  `,
  styles: `
    .learn-unit { max-width: 42rem; }
    .learn-unit.wide { max-width: 58rem; }
    app-learn-slide-deck { display: block; margin: 0 0 1rem; }
    .back { margin: 0 0 1rem; }
    .back a { color: #0b6e4f; text-decoration: none; font-weight: 600; }
    .back a:hover { text-decoration: underline; }
    h1 { margin: 0 0 0.75rem; color: #12263a; font-size: 1.75rem; }
    .summary { color: #5a6b7d; margin: 0 0 1rem; line-height: 1.5; }
    .phase-nav { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; font-size: 0.85rem; }
    .phase-nav span { padding: 0.25rem 0.55rem; border-radius: 999px; background: #eef2f6; color: #5a6b7d; }
    .phase-nav span.active { background: #0b6e4f; color: #fff; font-weight: 600; }
    .phase-nav span b { font-weight: 700; opacity: 0.8; margin-left: 0.15rem; }
    .phase-nav span.bonus { border: 1px dashed #0b6e4f; background: #f0f7f4; color: #0b6e4f; }
    .phase-nav span.bonus.active { background: #0b6e4f; color: #fff; border-style: solid; }
    .phase-nav .points-earned { margin-left: auto; background: transparent; color: #0b6e4f; font-weight: 700; }
    .notice.done { margin: 0 0 0.75rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #e8f5f0; color: #0b6e4f; font-size: 0.92rem; }
    .panel { border-top: 1px solid #d8dee6; padding-top: 1rem; }
    .panel h2 { margin: 0 0 0.75rem; font-size: 1.15rem; color: #12263a; }
    .lesson-block { margin-bottom: 1rem; }
    .lesson-block h3 { margin: 0 0 0.35rem; font-size: 1rem; color: #0b6e4f; }
    .lesson-block p { margin: 0; line-height: 1.55; color: #334155; }
    .read-confirm { display: flex; gap: 0.5rem; align-items: flex-start; margin: 1rem 0; cursor: pointer; }
    .hint { color: #5a6b7d; line-height: 1.45; margin: 0 0 1rem; }
    .hint.small { font-size: 0.9rem; }
    .quiz-q { border: 1px solid #d8dee6; border-radius: 8px; padding: 0.75rem 1rem; margin: 0 0 1rem; }
    .quiz-q legend { font-weight: 600; padding: 0 0.25rem; }
    .quiz-q.correct { border-color: #0b6e4f; background: #f0f7f4; }
    .quiz-q.wrong { border-color: #c2410c; background: #fff7ed; }
    .quiz-opt { display: flex; gap: 0.5rem; margin: 0.35rem 0; cursor: pointer; }
    .quiz-feedback { margin: 0.5rem 0 0; font-size: 0.92rem; }
    .quiz-feedback.ok { color: #0b6e4f; }
    .criteria { margin: 0 0 1rem; padding-left: 1.2rem; color: #334155; line-height: 1.5; }
    .task-brief { margin: 0 0 0.85rem; padding: 0.75rem 0.9rem; border-radius: 8px; background: #f0f7f4; border: 1px solid #c5e6d8; }
    .task-brief h3 { margin: 0 0 0.35rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #0b6e4f; }
    .task-brief p { margin: 0; color: #12263a; line-height: 1.55; }
    .task-steps { margin: 0 0 0.85rem; color: #334155; }
    .task-steps summary { cursor: pointer; font-weight: 600; color: #0b6e4f; }
    .task-steps ol { margin: 0.5rem 0 0; padding-left: 1.3rem; line-height: 1.5; }
    .checks-heading { margin: 0 0 0.35rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #5a6b7d; }
    .cta {
      display: inline-block; margin: 0.5rem 0.5rem 0.5rem 0; padding: 0.55rem 1rem;
      background: #0b6e4f; color: #fff; text-decoration: none; border: none; border-radius: 6px;
      font-weight: 600; cursor: pointer;
    }
    .cta:hover { background: #095c42; }
    .cta:disabled { opacity: 0.5; cursor: not-allowed; }
    .cta.secondary { background: #1e4d7b; }
    .locked { margin: 0 0 1rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #eef2f6; color: #5a6b7d; }
    .notice.offline { margin: 0 0 1rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #fff7ed; color: #9a3412; font-size: 0.92rem; }
    .notice.rejected { margin: 0 0 1rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #fef2f2; color: #991b1b; font-size: 0.92rem; }
    .complete p { color: #334155; line-height: 1.5; }
  `
})
export class LearnUnitPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(LearnSeoService);
  private readonly analytics = inject(LearnAnalyticsService);
  private readonly catalog = inject(LearnCatalogService);
  readonly progress = inject(LearnProgressService);
  private readonly api = inject(LearningApiClient);

  readonly unit = signal<LearnUnitDetailResponse | null>(null);
  readonly readConfirmed = signal(false);
  readonly answers = signal<Record<number, string>>({});
  readonly quizResults = signal<QuizQuestionResultDto[]>([]);
  readonly quizSubmitted = signal(false);
  readonly quizPassed = signal(false);
  /** Server definitively rejected the submission (locked unit / prerequisites) — not an offline case. */
  readonly quizRejected = signal(false);

  /** Illustrated slide deck for this unit, when one is authored (else the two lesson blocks). */
  readonly slideDeck = computed(() => {
    const u = this.unit();
    return u ? learnSlideDeckFor(u.unitSlug) : null;
  });
  /** Learner has reached the last slide — unlocks the read confirmation. */
  readonly deckFinished = signal(false);
  /** Slide restored from the `#slide-N` URL fragment (deep link / refresh). */
  readonly startSlide = signal(0);

  /** Theory-only units skip the Lab phase entirely. */
  readonly hasLab = computed(() => {
    const u = this.unit();
    return !!u && unitHasLab(findLearnUnit(u.moduleSlug, u.unitSlug));
  });
  readonly points = LEARN_POINTS;
  readonly pointsEarned = computed(() => {
    const u = this.unit();
    return u ? unitPointsEarned(this.progress.progressFor(u.moduleSlug, u.unitSlug), this.hasLab()) : 0;
  });
  readonly pointsMax = computed(() => unitPointsMax(this.hasLab()));

  readonly phase = computed((): LearnUnitPhase => {
    const u = this.unit();
    if (!u) return 'read';
    const p = this.progress.progressFor(u.moduleSlug, u.unitSlug);
    return resolveUnitPhase(p, u.availability, this.hasLab());
  });

  readonly learnUnitPath = learnUnitPath;

  private readonly i18n = inject(I18nService);

  /** Plain-language task: what to build and what counts (falls back to the unit summary). */
  labGoal(u: LearnUnitDetailResponse): string {
    const key = `${u.i18nKeyPrefix}.labGoal`;
    return this.i18n.t(this.i18n.has(key) ? key : `${u.i18nKeyPrefix}.summary`);
  }

  /** Suggested steps (the unit's stepN keys). */
  labSteps(u: LearnUnitDetailResponse): string[] {
    const unit = findLearnUnit(u.moduleSlug, u.unitSlug);
    if (!unit) return [];
    return Array.from({ length: unit.stepCount }, (_, i) => learnStepKey(unit, i + 1)).filter((k) => this.i18n.has(k));
  }

  onDeckFinished(): void {
    this.deckFinished.set(true);
  }

  /** Mirror the current slide into the URL fragment without adding history entries. */
  onSlideChange(index: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      fragment: `slide-${index + 1}`,
      queryParamsHandling: 'preserve',
      replaceUrl: true
    });
  }

  /** Bumped on every navigation so a slow earlier bootstrap cannot overwrite the current unit. */
  private bootstrapGeneration = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.resetUnitState();
      const m = /^slide-(\d+)$/.exec(this.route.snapshot.fragment ?? '');
      this.startSlide.set(m ? Math.max(0, Number(m[1]) - 1) : 0);
      void this.bootstrap(
        ++this.bootstrapGeneration,
        params.get('moduleSlug') ?? '',
        params.get('unitSlug') ?? ''
      );
    });
  }

  isLocked(u: LearnUnitDetailResponse): boolean {
    return u.availability === 'locked';
  }

  private resetUnitState(): void {
    this.deckFinished.set(false);
    this.unit.set(null);
    this.readConfirmed.set(false);
    this.answers.set({});
    this.quizResults.set([]);
    this.quizSubmitted.set(false);
    this.quizPassed.set(false);
  }

  labQueryParams(u: LearnUnitDetailResponse): { from: string; challenge: string } {
    return {
      from: `${u.moduleSlug}/${u.unitSlug}`,
      challenge: '1'
    };
  }

  labChallengeCriteria(u: LearnUnitDetailResponse) {
    return specCriteriaForCheck(u.exampleId, u.labChallenge.criteria, u.unitSlug);
  }

  quizResult(questionId: number): boolean | null {
    const row = this.quizResults().find((r) => r.questionId === questionId);
    if (!row) return null;
    return row.correct;
  }

  quizFeedback(questionId: number): QuizQuestionResultDto | undefined {
    return this.quizResults().find((r) => r.questionId === questionId);
  }

  canSubmitQuiz(): boolean {
    const u = this.unit();
    if (!u) return false;
    return u.quiz.questions.every((q) => !!this.answers()[q.id]);
  }

  async onReadConfirm(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    this.readConfirmed.set(input.checked);
    const u = this.unit();
    if (!u) return;
    await this.markReadSafely(u, input.checked);
  }

  async continueToQuiz(): Promise<void> {
    const u = this.unit();
    if (!u || !this.readConfirmed()) return;
    await this.markReadSafely(u, true);
  }

  /** markRead rethrows definitive 4xx rejections (e.g. locked unit); reflect them instead of crashing the handler. */
  private async markReadSafely(u: LearnUnitDetailResponse, complete: boolean): Promise<void> {
    try {
      const row = await this.progress.markRead(u.moduleSlug, u.unitSlug, complete);
      this.patchUnitProgress(row);
    } catch {
      this.readConfirmed.set(false);
      this.patchUnitProgress(this.progress.progressFor(u.moduleSlug, u.unitSlug));
    }
  }

  setAnswer(questionId: number, optionId: string): void {
    this.answers.update((prev) => ({ ...prev, [questionId]: optionId }));
    this.quizSubmitted.set(false);
    this.quizResults.set([]);
  }

  async submitQuiz(): Promise<void> {
    const u = this.unit();
    if (!u || !this.canSubmitQuiz()) return;
    const answers = this.answers();
    this.quizRejected.set(false);
    try {
      const result = await firstValueFrom(this.api.submitQuiz(u.moduleSlug, u.unitSlug, { answers }));
      this.quizResults.set(result.results);
      this.quizSubmitted.set(true);
      this.quizPassed.set(result.passed);
      if (result.passed) {
        await this.progress.sync();
        const p = this.progress.progressFor(u.moduleSlug, u.unitSlug);
        this.patchUnitProgress(p);
      }
    } catch (err) {
      if (!isApiUnreachable(err)) {
        // Definitive server rejection (e.g. 409 unit-locked / quiz-required): do not grade locally.
        this.quizResults.set([]);
        this.quizSubmitted.set(false);
        this.quizPassed.set(false);
        this.quizRejected.set(true);
        return;
      }
      // API unreachable: grade with the client answer key and keep progress on this device.
      const graded = gradeQuizLocally(u, answers);
      this.quizResults.set(graded.results);
      this.quizSubmitted.set(true);
      this.quizPassed.set(graded.passed);
      if (graded.passed) {
        const row = this.progress.recordLocalQuizPass(u.moduleSlug, u.unitSlug, answers);
        this.patchUnitProgress(row);
      }
    }
  }

  goToLab(): void {
    if (!this.quizPassed()) return;
    const u = this.unit();
    if (!u) return;
    // Optimistic advance when local quiz pass outruns session progress sync.
    this.patchUnitProgress({
      readComplete: true,
      quizPassed: true,
      labPassed: u.progress.labPassed,
      complete: u.progress.complete
    });
  }

  onOpenLab(u: LearnUnitDetailResponse): void {
    this.analytics.openLab({
      moduleSlug: u.moduleSlug,
      unitSlug: u.unitSlug,
      exampleId: u.exampleId as never,
      i18nKeyPrefix: u.i18nKeyPrefix,
      stepCount: 0
    });
  }

  private async bootstrap(generation: number, moduleSlug: string, unitSlug: string): Promise<void> {
    const stale = () => generation !== this.bootstrapGeneration;

    await this.progress.sync();
    if (stale()) return;
    await this.catalog.reloadCatalog();
    if (stale()) return;
    this.catalog.applyFallbackAvailability(this.progress.progressSnapshot());

    const detail = await this.catalog.getUnitDetail(moduleSlug, unitSlug, { refresh: true });
    if (stale()) return;
    if (!detail) {
      void this.router.navigateByUrl('/learn');
      return;
    }

    const merged = {
      ...detail,
      availability: this.catalog.findUnitSummary(moduleSlug, unitSlug)?.availability ?? detail.availability,
      progress: this.progress.progressFor(moduleSlug, unitSlug)
    };
    this.unit.set(merged);
    this.readConfirmed.set(merged.progress.readComplete);

    const legacy = findLearnUnit(moduleSlug, unitSlug);
    if (legacy) {
      this.seo.setUnitPage(legacy);
      this.analytics.unitView(legacy);
    }
  }

  private patchUnitProgress(row: { readComplete: boolean; quizPassed: boolean; labPassed: boolean; complete: boolean }): void {
    const u = this.unit();
    if (!u) return;
    const progress = { ...u.progress, moduleSlug: u.moduleSlug, unitSlug: u.unitSlug, ...row };
    this.unit.set({
      ...u,
      progress,
      availability: row.complete ? 'complete' : u.availability
    });
    this.progress.applyProgress(progress);
    void this.catalog.reloadCatalog().then(() => {
      this.catalog.applyFallbackAvailability(this.progress.progressSnapshot());
    });
  }
}
