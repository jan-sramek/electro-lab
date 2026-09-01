import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
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
export class LabPageComponent implements OnInit {
  readonly editor = inject(LabEditorStore);
  readonly sim = inject(CircuitSimulationFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly learnSeo = inject(LearnSeoService);

  /** Learn unit when opened via `?from=module/unit`. */
  readonly learnContext = signal<LearnUnit | null>(null);
  readonly learnUnitPath = learnUnitPath;

  /** Context hint under the canvas: tool mode first, then example preset, else generic. */
  hintKey(): string {
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
    this.editor.initFromStorage();

    const from = this.route.snapshot.queryParamMap.get('from');
    if (from) {
      const unit = parseLearnFromSlug(from);
      if (unit) this.learnContext.set(unit);
    }

    const example = this.route.snapshot.queryParamMap.get('example');
    if (example === 'led') {
      this.onLoadPreset('led');
    } else if (example === 'ledFade' || example === 'fade') {
      this.onLoadPreset('ledFade');
    } else if (example === 'rc') {
      this.onLoadPreset('rc');
    } else if (example === 'bjt' || example === 'bc547') {
      this.onLoadPreset('bjt');
    } else if (example === 'relay') {
      this.onLoadPreset('relay');
    } else if (example === 'nmos' || example === 'mosfet') {
      this.onLoadPreset('nmos');
    } else if (example === 'ne555' || example === '555') {
      this.onLoadPreset('ne555');
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
    }
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
      case 'opamp':
        this.editor.loadOpAmpPreset();
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
    }
  }

  onPushbuttonPress(ev: { id: string; pressed: boolean }): void {
    this.editor.setPushbuttonPressed(ev.id, ev.pressed);
    this.sim.runLive();
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
    if (id) this.editor.replaceBurned(id);
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
      this.editor.escape();
    }
  }
}
