import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalysisMode, EditorTool } from '../../data/schematic.model';
import { ExamplePresetId } from '../../services/lab-editor.store';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-lab-toolbar',
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class LabToolbarComponent {
  readonly tool = input.required<EditorTool>();
  readonly analysisMode = input.required<AnalysisMode>();
  readonly tStop = input(0.005);
  readonly dt = input(5e-5);
  readonly acFreq = input(1000);
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly canDelete = input(false);
  readonly canDuplicate = input(false);
  readonly busy = input(false);
  readonly selectedPreset = input<ExamplePresetId | null>(null);

  readonly toolChange = output<EditorTool>();
  readonly analysisModeChange = output<AnalysisMode>();
  readonly tStopChange = output<number | string>();
  readonly dtChange = output<number | string>();
  readonly acFreqChange = output<number | string>();
  readonly undo = output<void>();
  readonly redo = output<void>();
  readonly remove = output<void>();
  readonly loadPreset = output<ExamplePresetId>();
  readonly newSchematic = output<void>();
  readonly duplicate = output<void>();
  readonly exportJson = output<void>();
  readonly importJson = output<File>();
  readonly run = output<void>();

  onImportFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.importJson.emit(file);
    input.value = '';
  }

  onPresetModelChange(value: string): void {
    if (
      value === 'led' ||
      value === 'ledFade' ||
      value === 'rc' ||
      value === 'pot' ||
      value === 'pulse' ||
      value === 'opamp' ||
      value === 'ac' ||
      value === 'bjt'
    ) {
      this.loadPreset.emit(value);
    }
  }
}
