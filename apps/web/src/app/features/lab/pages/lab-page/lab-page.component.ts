import { Component, HostListener, OnInit, inject } from '@angular/core';
import { LabEditorStore } from '../../services/lab-editor.store';
import { CircuitSimulationFacade } from '../../services/circuit-simulation.facade';
import { SchematicPersistence } from '../../services/schematic-persistence';
import { ComponentPaletteComponent } from '../../components/palette/palette.component';
import { SchematicCanvasComponent } from '../../components/canvas/canvas.component';
import { InspectorPanelComponent } from '../../components/inspector/inspector.component';
import { LabToolbarComponent } from '../../components/toolbar/toolbar.component';
import { ResultsPanelComponent } from '../../components/results-panel/results-panel.component';
import { ProbeSummaryComponent } from '../../components/probe-summary/probe-summary.component';
import { ScopeComponent } from '../../components/scope/scope.component';
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
    ProbeSummaryComponent,
    ScopeComponent,
    TranslatePipe
  ],
  providers: [SchematicPersistence, LabEditorStore, CircuitSimulationFacade],
  templateUrl: './lab-page.component.html',
  styleUrl: './lab-page.component.css'
})
export class LabPageComponent implements OnInit {
  readonly editor = inject(LabEditorStore);
  readonly sim = inject(CircuitSimulationFacade);

  ngOnInit(): void {
    this.editor.initFromStorage();
  }

  @HostListener('window:keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
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
    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (this.editor.selectedId()) {
        ev.preventDefault();
        this.editor.deleteSelected();
      }
    } else if (ev.key === 'Escape') {
      this.editor.escape();
    }
  }
}
