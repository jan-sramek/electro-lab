import { Component, HostListener, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    TranslatePipe
  ],
  providers: [SchematicPersistence, LabEditorStore, CircuitSimulationFacade],
  templateUrl: './lab-page.component.html',
  styleUrl: './lab-page.component.css'
})
export class LabPageComponent implements OnInit {
  readonly editor = inject(LabEditorStore);
  readonly sim = inject(CircuitSimulationFacade);
  private readonly route = inject(ActivatedRoute);

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
    this.editor.initFromStorage();
    const example = this.route.snapshot.queryParamMap.get('example');
    if (example === 'bjt' || example === 'bc547') {
      this.onLoadPreset('bjt');
    } else if (example === 'relay') {
      this.onLoadPreset('relay');
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
    }
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
