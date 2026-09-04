import { Component, computed, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LabEditorStore, ExamplePresetId } from '../../services/lab-editor.store';
import { CircuitSimulationFacade } from '../../services/circuit-simulation.facade';
import { SchematicPersistence } from '../../services/schematic-persistence';
import { ComponentPaletteComponent } from '../../components/palette/palette.component';
import { SchematicCanvasComponent } from '../../components/canvas/canvas.component';
import { InspectorPanelComponent } from '../../components/inspector/inspector.component';
import { LabToolbarComponent } from '../../components/toolbar/toolbar.component';
import { ResultsPanelComponent } from '../../components/results-panel/results-panel.component';
import { StatusBannerComponent } from '../../components/status-banner/status-banner.component';
import { ScopeComponent } from '../../components/scope/scope.component';
import { CircuitTabsComponent } from '../../components/circuit-tabs/circuit-tabs.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LearnSeoService } from '../../../learn/services/learn-seo.service';
import { parseLearnFromSlug } from '../../../learn/data/learn-catalog';
import { learnUnitPath, LearnUnit } from '../../../learn/data/learn-catalog.model';
import { LearnLabChallengeService } from '../../../learn/services/learn-lab-challenge.service';
import { LearnUnitDetailResponse } from '../../../learn/api/learning-api.types';
import { CriterionCheckResult } from '../../../learn/data/lab-challenge-checker';
import { getLearnChallengeSpec, specCriteriaForCheck } from '../../../learn/data/learn-challenge-spec';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-lab-page',
  standalone: true,
  imports: [
    ComponentPaletteComponent,
    SchematicCanvasComponent,
    InspectorPanelComponent,
    LabToolbarComponent,
    ResultsPanelComponent,
    StatusBannerComponent,
    ScopeComponent,
    CircuitTabsComponent,
    TranslatePipe,
    RouterLink
  ],
  providers: [SchematicPersistence, LabEditorStore, CircuitSimulationFacade],
  templateUrl: './lab-page.component.html',
  styleUrl: './lab-page.component.css'
})
export class LabPageComponent implements OnInit, OnDestroy {
  readonly editor = inject(LabEditorStore);
  readonly sim = inject(CircuitSimulationFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly learnSeo = inject(LearnSeoService);
  private readonly learnChallenge = inject(LearnLabChallengeService);
  private readonly i18n = inject(I18nService);

  /** Learn unit when opened via `?from=module/unit`. */
  readonly learnContext = signal<LearnUnit | null>(null);
  readonly learnChallengeUnit = signal<LearnUnitDetailResponse | null>(null);
  readonly challengeResults = signal<CriterionCheckResult[]>([]);
  readonly challengePassed = signal(false);
  readonly challengeChecking = signal(false);
  readonly challengeMessage = signal<string | null>(null);
  /** Inline confirm for Peek / Clear — avoids bare window.confirm. */
  readonly challengeConfirm = signal<'peek' | 'clear' | null>(null);
  /** Inline confirm for toolbar New schematic. */
  readonly newSchematicConfirm = signal(false);
  readonly learnUnitPath = learnUnitPath;

  readonly challengeCriteria = computed(() => {
    const unit = this.learnChallengeUnit();
    if (!unit) return [];
    return specCriteriaForCheck(unit.exampleId, unit.labChallenge.criteria, unit.unitSlug);
  });

  /** Context hint under the canvas: tool mode first, then example preset, else generic. */
  hintKey(): string {
    if (this.editor.learnChallengeMode()) return 'lab.hint.challenge';
    const tool = this.editor.tool();
    if (tool === 'wire') return 'lab.hint.wire';
    if (tool === 'probe') return 'lab.hint.probe';
    const preset = this.editor.activeExamplePreset();
    if (preset) return `lab.hint.${preset}`;
    return 'lab.hint';
  }

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.learnSeo.clearLearnSeo();

    const from = this.route.snapshot.queryParamMap.get('from');
    const challenge = this.route.snapshot.queryParamMap.get('challenge');
    if (from && challenge === '1') {
      const unit = parseLearnFromSlug(from);
      if (unit) {
        this.learnContext.set(unit);
        void this.startLearnChallenge(unit.moduleSlug, unit.unitSlug);
        return;
      }
    }

    this.editor.initFromStorage();

    const example = this.route.snapshot.queryParamMap.get('example');
    if (example === 'led') {
      this.onLoadPreset('led');
    } else if (example === 'ledFade' || example === 'fade') {
      this.onLoadPreset('ledFade');
    } else if (example === 'rc') {
      this.onLoadPreset('rc');
    } else if (example === 'pot') {
      this.onLoadPreset('pot');
    } else if (example === 'pulse') {
      this.onLoadPreset('pulse');
    } else if (example === 'diodeDirection' || example === 'diode') {
      this.onLoadPreset('diodeDirection');
    } else if (example === 'seriesParallel' || example === 'parallel') {
      this.onLoadPreset('seriesParallel');
    } else if (example === 'seriesLeds' || example === 'series') {
      this.onLoadPreset('seriesLeds');
    } else if (example === 'opampFollower' || example === 'follower' || example === 'buffer') {
      this.onLoadPreset('opampFollower');
    } else if (example === 'opamp' || example === 'opampInvert' || example === 'invert') {
      this.onLoadPreset('opamp');
    } else if (example === 'opampNonInv' || example === 'noninv' || example === 'nonInvert') {
      this.onLoadPreset('opampNonInv');
    } else if (example === 'opampComparator' || example === 'comparator') {
      this.onLoadPreset('opampComparator');
    } else if (example === 'opampSchmitt' || example === 'schmitt') {
      this.onLoadPreset('opampSchmitt');
    } else if (example === 'opampSumming' || example === 'summing') {
      this.onLoadPreset('opampSumming');
    } else if (example === 'opampIntegrator' || example === 'integrator') {
      this.onLoadPreset('opampIntegrator');
    } else if (example === 'opampDifferentiator' || example === 'differentiator') {
      this.onLoadPreset('opampDifferentiator');
    } else if (example === 'opampActiveFilter' || example === 'activeFilter') {
      this.onLoadPreset('opampActiveFilter');
    } else if (example === 'ac') {
      this.onLoadPreset('ac');
    } else if (example === 'bjt' || example === 'bc547') {
      this.onLoadPreset('bjt');
    } else if (example === 'relay') {
      this.onLoadPreset('relay');
    } else if (example === 'nmos' || example === 'mosfet') {
      this.onLoadPreset('nmos');
    } else if (example === 'ne555' || example === '555') {
      this.onLoadPreset('ne555');
    } else if (example === 'ne555Pot' || example === '555pot' || example === 'potBlink') {
      this.onLoadPreset('ne555Pot');
    } else if (example === 'christmas' || example === 'christmasTree' || example === 'tree') {
      this.onLoadPreset('christmasTree');
    } else if (example === 'pushbutton' || example === 'button') {
      this.onLoadPreset('pushbutton');
    } else if (example === 'ldr' || example === 'nightlight') {
      this.onLoadPreset('ldr');
    } else if (example === 'buzzer') {
      this.onLoadPreset('buzzer');
    } else if (example === 'motor') {
      this.onLoadPreset('motor');
    } else if (example === 'arduino' || example === 'dio') {
      this.onLoadPreset('arduino');
    } else if (example === 'i2c' || example === 'i2cOled' || example === 'oled' || example === 'ssd1306') {
      this.onLoadPreset('i2cOled');
    } else if (example === 'halfWave' || example === 'halfwave') {
      this.onLoadPreset('halfWave');
    } else if (example === 'bridge') {
      this.onLoadPreset('bridge');
    } else if (example === 'filterCap' || example === 'filter') {
      this.onLoadPreset('filterCap');
    } else if (example === 'zener') {
      this.onLoadPreset('zener');
    } else if (example === 'vreg7805' || example === '7805') {
      this.onLoadPreset('vreg7805');
    } else if (example === 'reversePolarity' || example === 'reverse') {
      this.onLoadPreset('reversePolarity');
    } else if (example === 'fuseProtect' || example === 'fuse') {
      this.onLoadPreset('fuseProtect');
    } else if (example === 'ripple') {
      this.onLoadPreset('ripple');
    } else if (example === 'buck') {
      this.onLoadPreset('buck');
    } else if (example === 'boost') {
      this.onLoadPreset('boost');
    } else if (example === 'rcLowPass' || example === 'lpf') {
      this.onLoadPreset('rcLowPass');
    } else if (example === 'rcHighPass' || example === 'hpf') {
      this.onLoadPreset('rcHighPass');
    } else if (example === 'rlcSeries' || example === 'rlc') {
      this.onLoadPreset('rlcSeries');
    } else if (example === 'bandPass' || example === 'bpf') {
      this.onLoadPreset('bandPass');
    } else if (example === 'notchFilter' || example === 'notch') {
      this.onLoadPreset('notchFilter');
    } else if (example === 'voltageDivider' || example === 'divider') {
      this.onLoadPreset('voltageDivider');
    } else if (example === 'measureAc' || example === 'measure') {
      this.onLoadPreset('measureAc');
    } else if (example === 'motorPwm' || example === 'pwm') {
      this.onLoadPreset('motorPwm');
    } else if (example === 'hBridge' || example === 'hbridge') {
      this.onLoadPreset('hBridge');
    } else if (example === 'motorDirection' || example === 'motorReverse') {
      this.onLoadPreset('motorDirection');
    } else if (example === 'pullUpDown' || example === 'pullup') {
      this.onLoadPreset('pullUpDown');
    } else if (example === 'debounce') {
      this.onLoadPreset('debounce');
    } else if (example === 'ntcDivider' || example === 'ntc') {
      this.onLoadPreset('ntcDivider');
    } else if (example === 'pwmFilter' || example === 'pwmDac') {
      this.onLoadPreset('pwmFilter');
    } else if (example === 'relayBjt' || example === 'relayTransistor') {
      this.onLoadPreset('relayBjt');
    } else if (example === 'estopRelay' || example === 'estop') {
      this.onLoadPreset('estopRelay');
    } else if (example === 'industrial24v' || example === '24v') {
      this.onLoadPreset('industrial24v');
    }
  }

  ngOnDestroy(): void {
    this.editor.endLearnChallenge();
  }

  onLoadPreset(id: ExamplePresetId): void {
    switch (id) {
      case 'led':
        this.editor.loadLedPreset();
        break;
      case 'ledFade':
        this.editor.loadLedFadePreset();
        break;
      case 'rc':
        this.editor.loadRcPreset();
        break;
      case 'pot':
        this.editor.loadPotPreset();
        break;
      case 'pulse':
        this.editor.loadPulsePreset();
        break;
      case 'diodeDirection':
        this.editor.loadDiodeDirectionPreset();
        break;
      case 'seriesParallel':
        this.editor.loadSeriesParallelPreset();
        break;
      case 'seriesLeds':
        this.editor.loadSeriesLedsPreset();
        break;
      case 'opamp':
        this.editor.loadOpAmpPreset();
        break;
      case 'opampFollower':
        this.editor.loadOpAmpFollowerPreset();
        break;
      case 'opampNonInv':
        this.editor.loadOpAmpNonInvPreset();
        break;
      case 'opampComparator':
        this.editor.loadOpAmpComparatorPreset();
        break;
      case 'opampSchmitt':
        this.editor.loadOpAmpSchmittPreset();
        break;
      case 'opampSumming':
        this.editor.loadOpAmpSummingPreset();
        break;
      case 'opampIntegrator':
        this.editor.loadOpAmpIntegratorPreset();
        break;
      case 'opampDifferentiator':
        this.editor.loadOpAmpDifferentiatorPreset();
        break;
      case 'opampActiveFilter':
        this.editor.loadOpAmpActiveFilterPreset();
        break;
      case 'ac':
        this.editor.loadAcPreset();
        break;
      case 'bjt':
        this.editor.loadBjtPreset();
        break;
      case 'relay':
        this.editor.loadRelayPreset();
        break;
      case 'nmos':
        this.editor.loadNmosPreset();
        break;
      case 'ne555':
        this.editor.loadNe555Preset();
        break;
      case 'ne555Pot':
        this.editor.loadNe555PotBlinkPreset();
        break;
      case 'christmasTree':
        this.editor.loadChristmasTreePreset();
        break;
      case 'pushbutton':
        this.editor.loadPushbuttonPreset();
        break;
      case 'ldr':
        this.editor.loadLdrPreset();
        break;
      case 'buzzer':
        this.editor.loadBuzzerPreset();
        break;
      case 'motor':
        this.editor.loadMotorPreset();
        break;
      case 'arduino':
        this.editor.loadArduinoPreset();
        break;
      case 'i2cOled':
        this.editor.loadI2cOledPreset();
        break;
      case 'halfWave':
        this.editor.loadHalfWavePreset();
        break;
      case 'bridge':
        this.editor.loadBridgePreset();
        break;
      case 'filterCap':
        this.editor.loadFilterCapPreset();
        break;
      case 'zener':
        this.editor.loadZenerPreset();
        break;
      case 'vreg7805':
        this.editor.loadVreg7805Preset();
        break;
      case 'reversePolarity':
        this.editor.loadReversePolarityPreset();
        break;
      case 'fuseProtect':
        this.editor.loadFuseProtectPreset();
        break;
      case 'ripple':
        this.editor.loadRipplePreset();
        break;
      case 'buck':
        this.editor.loadBuckPreset();
        break;
      case 'boost':
        this.editor.loadBoostPreset();
        break;
      case 'rcLowPass':
        this.editor.loadRcLowPassPreset();
        break;
      case 'rcHighPass':
        this.editor.loadRcHighPassPreset();
        break;
      case 'rlcSeries':
        this.editor.loadRlcSeriesPreset();
        break;
      case 'bandPass':
        this.editor.loadBandPassPreset();
        break;
      case 'notchFilter':
        this.editor.loadNotchFilterPreset();
        break;
      case 'voltageDivider':
        this.editor.loadVoltageDividerPreset();
        break;
      case 'measureAc':
        this.editor.loadMeasureAcPreset();
        break;
      case 'motorPwm':
        this.editor.loadMotorPwmPreset();
        break;
      case 'hBridge':
        this.editor.loadHBridgePreset();
        break;
      case 'motorDirection':
        this.editor.loadMotorDirectionPreset();
        break;
      case 'pullUpDown':
        this.editor.loadPullUpDownPreset();
        break;
      case 'debounce':
        this.editor.loadDebouncePreset();
        break;
      case 'ntcDivider':
        this.editor.loadNtcDividerPreset();
        break;
      case 'pwmFilter':
        this.editor.loadPwmFilterPreset();
        break;
      case 'relayBjt':
        this.editor.loadRelayBjtPreset();
        break;
      case 'estopRelay':
        this.editor.loadEstopRelayPreset();
        break;
      case 'industrial24v':
        this.editor.loadIndustrial24vPreset();
        break;
    }
  }

  onPushbuttonPress(ev: { id: string; pressed: boolean }): void {
    this.editor.setPushbuttonPressed(ev.id, ev.pressed);
    this.sim.runLive();
  }

  onStatusSelectPart(id: string): void {
    this.editor.setTool('select');
    this.editor.setSelection([id], false);
  }

  onInspectorMomentary(ev: { key: string; pressed: boolean }): void {
    const c = this.editor.selected();
    if (!c || c.modelKey !== 'pushbutton' || ev.key !== 'closed') return;
    this.onPushbuttonPress({ id: c.id, pressed: ev.pressed });
  }

  async onImport(file: File): Promise<void> {
    try {
      await this.editor.importJson(file);
    } catch {
      /* invalid file */
    }
  }

  onReplaceBurned(): void {
    const id = this.editor.selectedId();
    if (!id) return;
    const clearedSwitches = this.editor.replaceBurned(id);
    if (clearedSwitches) {
      this.sim.notifyClientWarning('lab.inspector.fuseReplacedClearedSwitches');
    }
  }

  async checkLearnChallenge(): Promise<void> {
    const unit = this.learnChallengeUnit();
    if (!unit || this.challengeChecking()) return;

    this.challengeChecking.set(true);
    try {
      // Always re-run so criteria see a fresh result (avoids racing the auto-run debounce).
      await this.sim.runAndWait();

      const criteria = this.challengeCriteria();
      const results = this.learnChallenge.evaluate(criteria, {
        doc: this.editor.doc(),
        result: this.sim.result(),
        analysisMode: this.editor.analysisMode()
      });
      this.challengeResults.set(results);

      const outcome = await this.learnChallenge.submitResults(
        unit.moduleSlug,
        unit.unitSlug,
        unit.labChallenge.criteria,
        results
      );
      // Only treat server-confirmed pass as "done" — API outage is local-OK, not progress saved.
      this.challengePassed.set(outcome === 'passed');
      this.challengeMessage.set(
        outcome === 'passed'
          ? 'lab.challenge.passed'
          : outcome === 'verify_unavailable'
            ? 'lab.challenge.verifyUnavailable'
            : 'lab.challenge.failed'
      );
    } finally {
      this.challengeChecking.set(false);
    }
  }

  /** Load the unit's teaching sample into the challenge tab as a rebuild reference. */
  peekChallengeSample(): void {
    if (!this.learnChallengeUnit()?.exampleId) return;
    this.challengeConfirm.set('peek');
  }

  /** Empty the challenge tab again without leaving challenge mode. */
  clearChallengeCanvas(): void {
    if (!this.editor.learnChallengeMode()) return;
    this.challengeConfirm.set('clear');
  }

  cancelChallengeConfirm(): void {
    this.challengeConfirm.set(null);
  }

  confirmChallengeAction(): void {
    const action = this.challengeConfirm();
    this.challengeConfirm.set(null);
    if (action === 'peek') {
      const unit = this.learnChallengeUnit();
      if (!unit?.exampleId) return;
      this.challengeResults.set([]);
      this.challengePassed.set(false);
      this.challengeMessage.set(null);
      this.onLoadPreset(unit.exampleId as ExamplePresetId);
      return;
    }
    if (action === 'clear') {
      this.challengeResults.set([]);
      this.challengePassed.set(false);
      this.challengeMessage.set(null);
      this.editor.clearChallengeCanvas();
    }
  }

  requestNewSchematic(): void {
    if (this.editor.learnChallengeMode()) return;
    this.newSchematicConfirm.set(true);
  }

  cancelNewSchematic(): void {
    this.newSchematicConfirm.set(false);
  }

  confirmNewSchematic(): void {
    this.newSchematicConfirm.set(false);
    this.editor.newSchematic();
  }

  learnChallengePath(): string[] | null {
    const unit = this.learnChallengeUnit();
    if (!unit) return null;
    return ['/learn', unit.moduleSlug, unit.unitSlug];
  }

  criterionPassed(criterionId: number): boolean | null {
    const row = this.challengeResults().find((r) => r.criterionId === criterionId);
    return row ? row.passed : null;
  }

  private async startLearnChallenge(moduleSlug: string, unitSlug: string): Promise<void> {
    const detail = await this.learnChallenge.loadChallengeUnit(moduleSlug, unitSlug);
    if (!detail) {
      this.editor.initFromStorage();
      return;
    }

    this.learnChallengeUnit.set(detail);
    const spec = getLearnChallengeSpec(detail.exampleId);
    const tabNameKey = spec?.tabNameKey ?? 'learn.challenge.tab.default';
    this.editor.beginLearnChallenge({
      tabName: this.i18n.t(tabNameKey),
      analysisMode: spec?.analysisMode ?? 'dcOp',
      tStop: spec?.tStop,
      dt: spec?.dt,
      initFromDc: spec?.initFromDc
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    const tag = (ev.target as HTMLElement)?.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const mod = ev.ctrlKey || ev.metaKey;

    if (mod && ev.key.toLowerCase() === 'z' && !ev.shiftKey) {
      ev.preventDefault();
      this.editor.undo();
    } else if (
      mod &&
      (ev.key.toLowerCase() === 'y' || (ev.key.toLowerCase() === 'z' && ev.shiftKey))
    ) {
      ev.preventDefault();
      this.editor.redo();
    } else if (mod && ev.key.toLowerCase() === 'd' && !inField) {
      ev.preventDefault();
      this.editor.duplicateSelected();
    } else if (mod && ev.key.toLowerCase() === 'c' && !inField) {
      ev.preventDefault();
      this.editor.copySelected();
    } else if (mod && ev.key.toLowerCase() === 'v' && !inField) {
      ev.preventDefault();
      this.editor.pasteClipboard();
    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (inField) return;
      if (this.editor.selectedIds().length || this.editor.selectedWireIds().length) {
        ev.preventDefault();
        this.editor.deleteSelected();
      }
    } else if (ev.key === 'Escape') {
      if (this.challengeConfirm()) {
        this.cancelChallengeConfirm();
        return;
      }
      if (this.newSchematicConfirm()) {
        this.cancelNewSchematic();
        return;
      }
      this.editor.escape();
    }
  }
}
