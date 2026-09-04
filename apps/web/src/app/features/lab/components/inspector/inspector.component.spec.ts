import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectorPanelComponent } from './inspector.component';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { createLedPreset } from '../../data/presets/led-series.preset';

describe('InspectorPanelComponent', () => {
  let fixture: ComponentFixture<InspectorPanelComponent>;
  let component: InspectorPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectorPanelComponent],
      providers: [{ provide: I18nService, useValue: { t: (k: string) => k, locale: () => 'en' } }]
    }).compileComponents();
    fixture = TestBed.createComponent(InspectorPanelComponent);
    component = fixture.componentInstance;
  });

  it('exposes wire endpoints when wires are selected', () => {
    const doc = createLedPreset();
    const wireId = doc.wires[0]!.id;
    fixture.componentRef.setInput('doc', doc);
    fixture.componentRef.setInput('selectedWireIds', [wireId]);
    fixture.componentRef.setInput('selected', null);
    fixture.componentRef.setInput('selectionCount', 0);
    fixture.detectChanges();
    const sel = component.wireSelection();
    expect(sel?.count).toBe(1);
    expect(sel?.primary.id).toBe(wireId);
    expect(sel?.endpoints[0]?.a).toContain('.');
  });
});
