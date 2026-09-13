import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LearningApiClient } from '../../api/learning-api.client';
import {
  LearnQuizQuestionDto,
  LearnUnitDetailResponse,
  LearnUnitPhase,
  QuizQuestionResultDto,
  resolveUnitPhase
} from '../../api/learning-api.types';
import { unitHasLab } from '../../data/learn-catalog.model';
import {
  LEARN_POINTS,
  quizMaxPointsFor,
  quizPointsForCorrect,
  unitPointsEarned,
  unitPointsMax
} from '../../data/learn-points';
import { learnUnitPath } from '../../data/learn-catalog.model';
import { LearnAnalyticsService } from '../../services/learn-analytics.service';
import { LearnCatalogService } from '../../services/learn-catalog.service';
import { LearnProgressService } from '../../services/learn-progress.service';
import { LearnSeoService } from '../../services/learn-seo.service';
import { findLearnUnit } from '../../data/learn-catalog';
import { specCriteriaForCheck } from '../../data/learn-challenge-spec';
import { firstValueFrom } from 'rxjs';
import { gradeQuizLocally, correctOptionForOrder, shuffleCopy } from '../../data/learn-quiz-grading';
import { isApiUnreachable } from '../../services/learn-api-errors';
import { learnSlideDeckFor } from '../../data/learn-slides-content';
import { autoDeckFor } from '../../data/learn-auto-deck';
import { unitIsOptional } from '../../data/learn-catalog.model';
import { LearnSlideDeckComponent } from '../../components/learn-slide-deck/learn-slide-deck.component';
import { CriterionLabelPipe } from '../../data/learn-criterion-label.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { learnStepKey } from '../../data/learn-catalog.model';

const QUIZ_SECONDS = 20;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 15.5;

type QuizStage = 'ready' | 'answering' | 'feedback' | 'summary';

interface QuizQuestionFeedback {
  correct: boolean;
  correctOptionId: string;
  explanationKey: string;
  timedOut: boolean;
}

@Component({
  selector: 'app-learn-unit-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, LearnSlideDeckComponent, CriterionLabelPipe],
  // The page depends on the visitor's session (progress, phase) which the server cannot know, so the
  // client re-renders it from scratch instead of hydrating the anonymous server markup. Without this
  // the server-rendered article lingered above the client one when the fresh data arrived.
  host: { ngSkipHydration: 'true' },
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
              <button type="button" [class.active]="displayPhase() === 'read'" [class.done]="phaseIndex(phase()) > 0" [disabled]="!canView('read')" (click)="showPhase('read')">
                {{ 'learn.unit.phase.read' | t }} <b>{{ 'learn.points.plus' | t: { pts: points.read } }}</b>
              </button>
              <button type="button" [class.active]="displayPhase() === 'quiz'" [class.done]="phaseIndex(phase()) > 1" [disabled]="!canView('quiz')" (click)="showPhase('quiz')">
                {{ 'learn.unit.phase.quiz' | t }} <b>{{ 'learn.points.plus' | t: { pts: quizPoints() } }}</b>
              </button>
              @if (hasLab()) {
                <button type="button" [class.active]="displayPhase() === 'lab'" [class.done]="phaseIndex(phase()) > 2" class="bonus" [disabled]="!canView('lab')" (click)="showPhase('lab')">
                  {{ 'learn.unit.phase.lab' | t }} <b>{{ 'learn.points.bonus' | t: { pts: points.lab } }}</b>
                </button>
              }
              <button type="button" [class.active]="displayPhase() === 'complete'" [disabled]="!canView('complete')" (click)="showPhase('complete')">{{ 'learn.unit.phase.done' | t }}</button>
              <span class="points-earned">{{ 'learn.points.unit' | t: { earned: pointsEarned(), max: pointsMax() } }}</span>
            </nav>
            @if (isOptional()) {
              <p class="notice optional" role="note">{{ 'learn.unit.optionalNote' | t }}</p>
            }
            @if (viewPhase() && viewPhase() !== phase()) {
              <p class="notice reviewing" role="status">
                {{ 'learn.unit.reviewing' | t }}
                <button type="button" class="link" (click)="viewPhase.set(null)">{{ 'learn.unit.backToCurrent' | t }}</button>
              </p>
            }
          }
          @if (progress.savedLocally()) {
            <p class="notice offline" role="status">{{ 'learn.unit.offlineSaved' | t }}</p>
          }
        </header>

        @if (displayPhase() === 'read') {
          <section class="panel">
            <h2>{{ 'learn.unit.readHeading' | t }}</h2>
            @if (slideDeck(); as deck) {
              <app-learn-slide-deck
                [slides]="deck"
                [startIndex]="startSlide()"
                (lastReached)="onDeckFinished()"
                (indexChange)="onSlideChange($event)"
              />
              @if (!isLocked(u) && !deckFinished() && phase() === 'read') {
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
            } @else if (phase() === 'read' && (!slideDeck() || deckFinished())) {
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

        @if (displayPhase() === 'quiz') {
          <section class="panel quiz-panel">
            <h2>{{ (isFinalQuiz() ? 'learn.unit.finalQuizHeading' : 'learn.unit.quizHeading') | t }}</h2>
            <p class="hint">
              {{
                (u.quiz.passCount < u.quiz.questions.length ? 'learn.unit.quizHintThreshold' : 'learn.unit.quizHint')
                  | t: { pass: u.quiz.passCount, total: u.quiz.questions.length, seconds: quizSeconds }
              }}
            </p>

            @if (quizStage() === 'ready') {
              <button class="cta" type="button" (click)="startQuiz()">
                {{ 'learn.unit.startQuiz' | t }}
              </button>
            } @else if (quizStage() === 'summary') {
              @if (quizRejected()) {
                <p class="notice rejected" role="alert">{{ 'learn.unit.quizRejected' | t }}</p>
              }
              @if (quizScore(); as score) {
                <div class="quiz-summary" [class.ok]="quizPassed()" [class.bad]="!quizPassed()" role="status">
                  <div class="quiz-summary-badge" aria-hidden="true">{{ quizPassed() ? '✓' : '✗' }}</div>
                  <div>
                    <p class="quiz-score" [class.ok]="quizPassed()">
                      {{ (quizPassed() ? 'learn.unit.quizScorePassed' : 'learn.unit.quizScoreFailed') | t: { correct: score.correct, total: score.total, pass: u.quiz.passCount } }}
                    </p>
                    <p class="quiz-points-line">{{ 'learn.unit.quizPointsEarned' | t: { pts: score.points } }}</p>
                  </div>
                </div>
              }
              <button class="cta" type="button" (click)="restartQuiz()">
                {{ 'learn.unit.retryQuiz' | t }}
              </button>
              @if (quizPassed()) {
                <button class="cta secondary" type="button" (click)="continueAfterQuiz()">
                  {{ (hasLab() ? 'learn.unit.continueToLab' : 'learn.unit.finishUnit') | t }}
                </button>
              }
            } @else {
              @if (currentQuizQuestion(); as q) {
                <div class="quiz-toolbar">
                  <span class="quiz-progress">{{ 'learn.unit.quizProgress' | t: { n: quizIndex() + 1, total: u.quiz.questions.length } }}</span>
                  <div
                    class="quiz-timer"
                    [class.urgent]="secondsLeft() <= 5"
                    [class.stopped]="quizStage() === 'feedback'"
                    role="timer"
                    [attr.aria-label]="('learn.unit.quizTimerLabel' | t) + ': ' + secondsLeft()"
                  >
                    <svg class="quiz-timer-ring" viewBox="0 0 36 36" aria-hidden="true">
                      <circle class="quiz-timer-track" cx="18" cy="18" r="15.5" />
                      <circle
                        class="quiz-timer-value"
                        cx="18"
                        cy="18"
                        r="15.5"
                        [style.stroke-dasharray]="timerDash()"
                      />
                    </svg>
                    <span class="quiz-timer-text">{{ 'learn.unit.quizTimer' | t: { s: secondsLeft() } }}</span>
                  </div>
                </div>

                <fieldset
                  class="quiz-q"
                  [class.correct]="quizStage() === 'feedback' && lastFeedback()?.correct === true"
                  [class.wrong]="quizStage() === 'feedback' && lastFeedback()?.correct === false"
                  [disabled]="quizStage() === 'feedback'"
                >
                  <legend>{{ q.promptKey | t }}</legend>
                  @for (opt of currentQuizOptions(); track opt.id) {
                    <label
                      class="quiz-opt"
                      [class.picked]="answers()[q.id] === opt.id"
                      [class.right]="quizStage() === 'feedback' && lastFeedback()?.correctOptionId === opt.id"
                      [class.miss]="quizStage() === 'feedback' && answers()[q.id] === opt.id && lastFeedback()?.correct === false"
                    >
                      <input
                        type="radio"
                        [name]="'q' + q.id"
                        [value]="opt.id"
                        [checked]="answers()[q.id] === opt.id"
                        [disabled]="quizStage() === 'feedback'"
                        (change)="pickQuizAnswer(opt.id)"
                      />
                      <span>{{ opt.labelKey | t }}</span>
                    </label>
                  }
                </fieldset>

                @if (quizStage() === 'feedback' && lastFeedback(); as fb) {
                  <div class="quiz-verdict" [class.ok]="fb.correct" [class.bad]="!fb.correct" role="status">
                    <div class="quiz-verdict-badge" aria-hidden="true">{{ fb.correct ? '✓' : '✗' }}</div>
                    <div class="quiz-verdict-copy">
                      <strong>{{
                        (fb.timedOut
                          ? 'learn.unit.quizTimedOut'
                          : fb.correct
                            ? 'learn.unit.quizCorrect'
                            : 'learn.unit.quizWrong') | t
                      }}</strong>
                      @if (fb.correct) {
                        <p class="quiz-points-line">{{ 'learn.unit.quizPointsEarned' | t: { pts: pointsPerQuestion() } }}</p>
                      }
                      <p class="quiz-feedback" [class.ok]="fb.correct">{{ fb.explanationKey | t }}</p>
                    </div>
                  </div>
                  <button class="cta" type="button" (click)="advanceQuiz()">
                    {{
                      (quizIndex() + 1 >= u.quiz.questions.length
                        ? 'learn.unit.quizSeeResults'
                        : 'learn.unit.quizNext') | t
                    }}
                  </button>
                }
              }
            }
          </section>
        }

        @if (displayPhase() === 'lab') {
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

        @if (displayPhase() === 'complete') {
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
    .phase-nav span, .phase-nav button { padding: 0.25rem 0.55rem; border-radius: 999px; background: #eef2f6; color: #5a6b7d; border: 1px solid transparent; font: inherit; font-size: 0.85rem; }
    .phase-nav button { cursor: pointer; }
    .phase-nav button:disabled { cursor: default; opacity: 0.7; }
    .phase-nav button.done:not(.active) { background: #e8f5f0; color: #0b6e4f; }
    .phase-nav button:not(:disabled):hover:not(.active) { border-color: #0b6e4f; }
    .phase-nav .active { background: #0b6e4f; color: #fff; font-weight: 600; }
    .phase-nav b { font-weight: 700; opacity: 0.8; margin-left: 0.15rem; }
    .phase-nav .bonus { border: 1px dashed #0b6e4f; background: #f0f7f4; color: #0b6e4f; }
    .phase-nav .bonus.active { background: #0b6e4f; color: #fff; border-style: solid; }
    .notice.optional { margin: 0 0 1rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #eef2f6; color: #4a5d73; font-size: 0.92rem; }
    .notice.reviewing { margin: 0 0 1rem; padding: 0.6rem 0.8rem; border-radius: 6px; background: #f0f7f4; color: #0b6e4f; font-size: 0.92rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .link { background: none; border: none; padding: 0; color: #0b6e4f; font: inherit; font-weight: 600; text-decoration: underline; cursor: pointer; }
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
    .quiz-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 0 0 1rem; }
    .quiz-progress { font-weight: 700; color: #0b6e4f; font-size: 0.95rem; }
    .quiz-timer {
      position: relative; width: 3.25rem; height: 3.25rem; flex-shrink: 0;
      display: grid; place-items: center;
    }
    .quiz-timer-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
    .quiz-timer-track { fill: none; stroke: #e2e8f0; stroke-width: 3; }
    .quiz-timer-value {
      fill: none; stroke: #0b6e4f; stroke-width: 3; stroke-linecap: round;
      stroke-dashoffset: 0; transition: stroke-dasharray 0.2s linear;
    }
    .quiz-timer.urgent .quiz-timer-value { stroke: #c2410c; }
    .quiz-timer.stopped .quiz-timer-value { stroke: #94a3b8; }
    .quiz-timer-text { position: relative; z-index: 1; font-weight: 800; font-size: 0.85rem; color: #12263a; }
    .quiz-timer.urgent .quiz-timer-text { color: #c2410c; }
    .quiz-q { border: 1px solid #d8dee6; border-radius: 10px; padding: 0.85rem 1rem; margin: 0 0 1rem; transition: border-color 0.2s, background 0.2s; }
    .quiz-q legend { font-weight: 600; padding: 0 0.25rem; color: #12263a; }
    .quiz-q.correct { border-color: #0b6e4f; background: #f0f7f4; }
    .quiz-q.wrong { border-color: #c2410c; background: #fff7ed; }
    .quiz-opt { display: flex; gap: 0.5rem; margin: 0.4rem 0; cursor: pointer; padding: 0.45rem 0.55rem; border-radius: 8px; border: 1px solid transparent; transition: background 0.15s, border-color 0.15s; }
    .quiz-opt:hover { background: #f8fafc; }
    .quiz-opt.picked { border-color: #94a3b8; background: #f1f5f9; }
    .quiz-opt.right { border-color: #0b6e4f; background: #e8f5f0; }
    .quiz-opt.miss { border-color: #c2410c; background: #fff7ed; }
    .quiz-verdict {
      display: flex; gap: 0.85rem; align-items: flex-start; margin: 0 0 1rem; padding: 0.85rem 1rem;
      border-radius: 10px; animation: quiz-pop 0.35s ease-out;
    }
    .quiz-verdict.ok { background: #e8f5f0; color: #0b6e4f; border: 1px solid #a7e0c8; }
    .quiz-verdict.bad { background: #fff7ed; color: #9a3412; border: 1px solid #fdba74; }
    .quiz-verdict-badge {
      width: 2.5rem; height: 2.5rem; border-radius: 999px; display: grid; place-items: center;
      font-size: 1.35rem; font-weight: 800; flex-shrink: 0; color: #fff;
    }
    .quiz-verdict.ok .quiz-verdict-badge { background: #0b6e4f; }
    .quiz-verdict.bad .quiz-verdict-badge { background: #c2410c; }
    .quiz-verdict-copy { min-width: 0; }
    .quiz-verdict-copy strong { display: block; font-size: 1.05rem; margin-bottom: 0.25rem; }
    .quiz-feedback { margin: 0; font-size: 0.92rem; line-height: 1.45; color: inherit; }
    .quiz-feedback.ok { color: #0b6e4f; }
    .quiz-summary {
      display: flex; gap: 0.85rem; align-items: center; margin: 0 0 1rem; padding: 1rem 1.1rem;
      border-radius: 12px; animation: quiz-pop 0.35s ease-out;
    }
    .quiz-summary.ok { background: #e8f5f0; border: 1px solid #a7e0c8; }
    .quiz-summary.bad { background: #fff7ed; border: 1px solid #fdba74; }
    .quiz-summary-badge {
      width: 3rem; height: 3rem; border-radius: 999px; display: grid; place-items: center;
      font-size: 1.6rem; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    .quiz-summary.ok .quiz-summary-badge { background: #0b6e4f; }
    .quiz-summary.bad .quiz-summary-badge { background: #c2410c; }
    .quiz-score { margin: 0; font-weight: 700; color: #c2410c; line-height: 1.4; }
    .quiz-score.ok { color: #0b6e4f; }
    .quiz-points-line { margin: 0.25rem 0 0; font-weight: 700; color: #0b6e4f; font-size: 0.95rem; }
    @keyframes quiz-pop {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .quiz-verdict, .quiz-summary { animation: none; }
      .quiz-timer-value { transition: none; }
    }
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
  readonly quizSeconds = QUIZ_SECONDS;
  readonly quizIndex = signal(0);
  readonly quizStage = signal<QuizStage>('answering');
  readonly secondsLeft = signal(QUIZ_SECONDS);
  readonly lastFeedback = signal<QuizQuestionFeedback | null>(null);
  /** Last graded attempt, for the score line. */
  readonly quizScore = signal<{ correct: number; total: number; points: number } | null>(null);

  readonly currentQuizQuestion = computed((): LearnQuizQuestionDto | null => {
    const u = this.unit();
    if (!u || this.quizStage() === 'ready') return null;
    return u.quiz.questions[this.quizIndex()] ?? null;
  });

  /** Per-attempt display order of option ids (grading still uses stable option ids). */
  readonly quizOptionOrder = signal<Record<number, string[]>>({});

  readonly currentQuizOptions = computed(() => {
    const q = this.currentQuizQuestion();
    if (!q) return [];
    const order = this.quizOptionOrder()[q.id];
    if (!order?.length) return q.options;
    const byId = new Map(q.options.map((o) => [o.id, o]));
    return order.map((id) => byId.get(id)).filter((o): o is (typeof q.options)[number] => !!o);
  });

  readonly pointsPerQuestion = computed(() => {
    const u = this.unit();
    if (!u || !u.quiz.questions.length) return 0;
    return quizPointsForCorrect(1, u.quiz.questions.length, this.isFinalQuiz(), u.unitSlug);
  });

  readonly timerDash = computed(() => {
    const frac = Math.max(0, this.secondsLeft()) / QUIZ_SECONDS;
    const filled = TIMER_CIRCUMFERENCE * frac;
    return `${filled} ${TIMER_CIRCUMFERENCE}`;
  });

  private quizTimerId: ReturnType<typeof setInterval> | null = null;

  /** Illustrated slide deck for this unit, when one is authored (else the two lesson blocks). */
  readonly slideDeck = computed(() => {
    const u = this.unit();
    if (!u) return null;
    return learnSlideDeckFor(u.unitSlug) ?? (u.lessonBlocks.length ? autoDeckFor(u) : null);
  });
  readonly isOptional = computed(() => {
    const u = this.unit();
    return !!u && unitIsOptional(findLearnUnit(u.moduleSlug, u.unitSlug));
  });
  /** Phase the learner chose to look at again (null = current phase). */
  readonly viewPhase = signal<LearnUnitPhase | null>(null);
  readonly displayPhase = computed((): LearnUnitPhase => {
    const chosen = this.viewPhase();
    if (!chosen) return this.phase();
    return this.phaseIndex(chosen) <= this.phaseIndex(this.phase()) ? chosen : this.phase();
  });
  private readonly phaseOrder: LearnUnitPhase[] = ['read', 'quiz', 'lab', 'complete'];
  phaseIndex(p: LearnUnitPhase): number {
    return this.phaseOrder.indexOf(p);
  }
  /** A phase can be revisited once the learner has reached it. */
  canView(p: LearnUnitPhase): boolean {
    const u = this.unit();
    if (!u || this.isLocked(u)) return false;
    if (p === 'lab' && !this.hasLab()) return false;
    return this.phaseIndex(p) <= this.phaseIndex(this.phase());
  }
  showPhase(p: LearnUnitPhase): void {
    if (!this.canView(p)) return;
    this.viewPhase.set(p === this.phase() ? null : p);
    if (p === 'quiz') this.prepareQuizLobby();
  }
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
  readonly isFinalQuiz = computed(() => {
    const u = this.unit();
    return !!u && !!findLearnUnit(u.moduleSlug, u.unitSlug)?.finalQuiz;
  });
  readonly quizPoints = computed(() => {
    const u = this.unit();
    return quizMaxPointsFor(u?.unitSlug, this.isFinalQuiz());
  });
  readonly pointsEarned = computed(() => {
    const u = this.unit();
    return u
      ? unitPointsEarned(
          this.progress.progressFor(u.moduleSlug, u.unitSlug),
          this.hasLab(),
          this.isFinalQuiz(),
          u.quiz.questions.length
        )
      : 0;
  });
  readonly pointsMax = computed(() => {
    const u = this.unit();
    return unitPointsMax(this.hasLab(), this.isFinalQuiz(), u?.unitSlug);
  });

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
    this.destroyRef.onDestroy(() => this.clearQuizTimer());
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
    this.clearQuizTimer();
    this.deckFinished.set(false);
    this.viewPhase.set(null);
    this.unit.set(null);
    this.readConfirmed.set(false);
    this.answers.set({});
    this.quizResults.set([]);
    this.quizSubmitted.set(false);
    this.quizPassed.set(false);
    this.quizRejected.set(false);
    this.quizScore.set(null);
    this.quizIndex.set(0);
    this.quizStage.set('ready');
    this.secondsLeft.set(QUIZ_SECONDS);
    this.lastFeedback.set(null);
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
    this.prepareQuizLobby();
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

  /** Show the quiz lobby (hint + Start) without starting the timer. */
  private prepareQuizLobby(): void {
    if (this.quizStage() === 'answering' || this.quizStage() === 'feedback') return;
    this.clearQuizTimer();
    this.quizStage.set('ready');
    this.quizIndex.set(0);
    this.lastFeedback.set(null);
    this.quizOptionOrder.set({});
    this.secondsLeft.set(QUIZ_SECONDS);
  }

  startQuiz(): void {
    this.clearQuizTimer();
    this.answers.set({});
    this.quizResults.set([]);
    this.quizSubmitted.set(false);
    this.quizPassed.set(false);
    this.quizRejected.set(false);
    this.quizScore.set(null);
    this.quizIndex.set(0);
    this.lastFeedback.set(null);
    this.seedQuizOptionOrders();
    this.quizStage.set('answering');
    this.secondsLeft.set(QUIZ_SECONDS);
    this.startQuestionTimer();
  }

  restartQuiz(): void {
    this.clearQuizTimer();
    this.answers.set({});
    this.quizResults.set([]);
    this.quizSubmitted.set(false);
    this.quizPassed.set(false);
    this.quizRejected.set(false);
    this.quizScore.set(null);
    this.quizIndex.set(0);
    this.lastFeedback.set(null);
    this.quizOptionOrder.set({});
    this.quizStage.set('ready');
    this.secondsLeft.set(QUIZ_SECONDS);
  }

  private seedQuizOptionOrders(): void {
    const u = this.unit();
    if (!u) {
      this.quizOptionOrder.set({});
      return;
    }
    const next: Record<number, string[]> = {};
    for (const q of u.quiz.questions) {
      next[q.id] = shuffleCopy(q.options.map((o) => o.id));
    }
    this.quizOptionOrder.set(next);
  }

  pickQuizAnswer(optionId: string): void {
    if (this.quizStage() !== 'answering') return;
    const q = this.currentQuizQuestion();
    const u = this.unit();
    if (!q || !u) return;
    this.answers.update((prev) => ({ ...prev, [q.id]: optionId }));
    this.resolveCurrentQuestion(false);
  }

  advanceQuiz(): void {
    if (this.quizStage() !== 'feedback') return;
    const u = this.unit();
    if (!u) return;
    const next = this.quizIndex() + 1;
    if (next >= u.quiz.questions.length) {
      void this.finishQuiz();
      return;
    }
    this.quizIndex.set(next);
    this.lastFeedback.set(null);
    this.quizStage.set('answering');
    this.secondsLeft.set(QUIZ_SECONDS);
    this.startQuestionTimer();
  }

  private resolveCurrentQuestion(timedOut: boolean): void {
    const q = this.currentQuizQuestion();
    const u = this.unit();
    if (!q || !u || this.quizStage() !== 'answering') return;
    this.clearQuizTimer();
    const order = q.order || this.quizIndex() + 1;
    const correctOptionId = correctOptionForOrder(order, u.unitSlug) ?? '';
    const chosen = this.answers()[q.id] ?? '';
    const correct = !timedOut && correctOptionId !== '' && chosen === correctOptionId;
    this.lastFeedback.set({
      correct,
      correctOptionId,
      explanationKey: `${u.i18nKeyPrefix}.quiz.q${order}.explain`,
      timedOut
    });
    this.quizStage.set('feedback');
  }

  private startQuestionTimer(): void {
    this.clearQuizTimer();
    this.secondsLeft.set(QUIZ_SECONDS);
    this.quizTimerId = setInterval(() => {
      const next = this.secondsLeft() - 1;
      if (next <= 0) {
        this.secondsLeft.set(0);
        this.resolveCurrentQuestion(true);
        return;
      }
      this.secondsLeft.set(next);
    }, 1000);
  }

  private clearQuizTimer(): void {
    if (this.quizTimerId != null) {
      clearInterval(this.quizTimerId);
      this.quizTimerId = null;
    }
  }

  private applyQuizAttempt(correct: number, total: number, passed: boolean): void {
    const points = quizPointsForCorrect(correct, total, this.isFinalQuiz(), u.unitSlug);
    this.quizScore.set({ correct, total, points });
    this.quizPassed.set(passed);
    const u = this.unit();
    if (!u) return;
    const prev = this.progress.progressFor(u.moduleSlug, u.unitSlug);
    const bestCorrect = Math.max(prev.quizCorrectCount ?? 0, correct);
    const bestTotal = bestCorrect > (prev.quizCorrectCount ?? 0) ? total : (prev.quizTotalCount ?? total);
    this.patchUnitProgress({
      ...prev,
      readComplete: true,
      quizPassed: prev.quizPassed || passed,
      quizCorrectCount: bestCorrect,
      quizTotalCount: bestCorrect > 0 ? bestTotal : (prev.quizTotalCount ?? total),
      complete: prev.complete || (prev.readComplete && (prev.quizPassed || passed))
    });
  }

  private async finishQuiz(): Promise<void> {
    const u = this.unit();
    if (!u) return;
    this.clearQuizTimer();
    this.quizStage.set('summary');
    this.quizRejected.set(false);
    const answers = this.answers();
    try {
      const result = await firstValueFrom(this.api.submitQuiz(u.moduleSlug, u.unitSlug, { answers }));
      this.quizResults.set(result.results);
      this.quizSubmitted.set(true);
      this.applyQuizAttempt(result.correctCount, result.totalCount, result.passed);
      if (result.passed) {
        await this.progress.sync();
        const p = this.progress.progressFor(u.moduleSlug, u.unitSlug);
        this.patchUnitProgress(p);
      }
    } catch (err) {
      if (!isApiUnreachable(err)) {
        this.quizResults.set([]);
        this.quizSubmitted.set(false);
        this.quizPassed.set(false);
        this.quizScore.set(null);
        this.quizRejected.set(true);
        return;
      }
      const graded = gradeQuizLocally(u, answers);
      this.quizResults.set(graded.results);
      this.quizSubmitted.set(true);
      this.applyQuizAttempt(graded.correctCount, graded.totalCount, graded.passed);
      if (graded.passed) {
        const row = this.progress.recordLocalQuizPass(
          u.moduleSlug,
          u.unitSlug,
          answers,
          graded.correctCount,
          graded.totalCount
        );
        this.patchUnitProgress(row);
      }
    }
  }

  /** Leave the quiz summary and open the lab bonus phase, or the unit-complete screen. */
  continueAfterQuiz(): void {
    if (!this.quizPassed()) return;
    const u = this.unit();
    if (!u) return;
    const prev = this.progress.progressFor(u.moduleSlug, u.unitSlug);
    this.patchUnitProgress({
      ...prev,
      readComplete: true,
      quizPassed: true,
      complete: true
    });
    // Follow the live phase (lab if this unit has one, otherwise complete) instead of staying on quiz.
    this.viewPhase.set(null);
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
    if (this.displayPhase() === 'quiz') this.prepareQuizLobby();

    const legacy = findLearnUnit(moduleSlug, unitSlug);
    if (legacy) {
      this.seo.setUnitPage(legacy);
      this.analytics.unitView(legacy);
    }
  }

  private patchUnitProgress(
    row: {
      readComplete: boolean;
      quizPassed: boolean;
      labPassed: boolean;
      complete: boolean;
      quizCorrectCount?: number | null;
      quizTotalCount?: number | null;
      moduleSlug?: string;
      unitSlug?: string;
    }
  ): void {
    const u = this.unit();
    if (!u) return;
    const progress = {
      ...u.progress,
      moduleSlug: u.moduleSlug,
      unitSlug: u.unitSlug,
      ...row
    };
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
