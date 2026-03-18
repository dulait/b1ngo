import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngThemePickerComponent } from './theme-picker.component';

describe('BngThemePickerComponent', () => {
  let fixture: ComponentFixture<BngThemePickerComponent>;
  let component: BngThemePickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngThemePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngThemePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role radiogroup', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group).toBeTruthy();
  });

  it('should render 4 theme swatches', () => {
    const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(4);
  });

  it('should mark current theme as checked', () => {
    const checked = fixture.nativeElement.querySelector('[aria-checked="true"]');
    expect(checked).toBeTruthy();
    expect(checked.getAttribute('aria-label')).toBe('Crimson');
  });

  it('should emit themeChange on click', () => {
    const spy = vi.fn();
    component.themeChange.subscribe(spy);
    const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
    radios[1].click(); // Ocean
    expect(spy).toHaveBeenCalledWith('ocean');
  });

  it('should show theme names', () => {
    expect(fixture.nativeElement.textContent).toContain('Crimson');
    expect(fixture.nativeElement.textContent).toContain('Ocean');
    expect(fixture.nativeElement.textContent).toContain('Citrus');
    expect(fixture.nativeElement.textContent).toContain('Midnight');
  });
});

describe('ThemeService', () => {
  // Theme service tested via the picker as it's tightly coupled
  it('should be importable', async () => {
    const { ThemeService } = await import('../../services/theme.service');
    expect(ThemeService).toBeTruthy();
  });
});
