import { Component, input, output } from '@angular/core';
import { AnalysisMode, EditorTool } from '../../data/schematic.model';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-lab-toolbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class LabToolbarComponent {
  readonly tool = input.required<EditorTool>();
  readonly analysisMode = input.required<AnalysisMode>();
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly busy = input(false);

  readonly toolChange = output<EditorTool>();
  readonly analysisModeChange = output<AnalysisMode>();
  readonly undo = output<void>();
  readonly redo = output<void>();
  readonly ledPreset = output<void>();
  readonly rcPreset = output<void>();
  readonly newSchematic = output<void>();
  readonly run = output<void>();
}
