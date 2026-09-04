import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBannerComponent } from './status-banner.component';
import { I18nService } from '../../../../core/i18n/i18n.service';

describe('StatusBannerComponent', () => {
  let fixture: ComponentFixture<StatusBannerComponent>;
  let component: StatusBannerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBannerComponent],
      providers: [
        {
          provide: I18nService,
          useValue: { t: (k: string) => k, locale: () => 'en' }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBannerComponent);
    component = fixture.componentInstance;
  });

  it('segments clickable part ids from highlight list', () => {
    fixture.componentRef.setInput('highlightIds', ['D1', 'R1']);
    fixture.detectChanges();
    const segs = component.segments('Check D1 and R1 wiring');
    expect(segs.map((s) => s.text)).toEqual(['Check ', 'D1', ' and ', 'R1', ' wiring']);
    expect(segs.filter((s) => s.partId).map((s) => s.partId)).toEqual(['D1', 'R1']);
  });

  it('returns plain text when no highlights', () => {
    fixture.componentRef.setInput('highlightIds', []);
    expect(component.segments('Nothing clickable')).toEqual([{ text: 'Nothing clickable' }]);
  });
});
