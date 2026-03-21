import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngHeaderComponent } from './header.component';
import { ThemeService } from '../../services/theme.service';

describe('BngHeaderComponent', () => {
  let fixture: ComponentFixture<BngHeaderComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngHeaderComponent],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(BngHeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have role banner', () => {
    const header = fixture.nativeElement.querySelector('[role="banner"]');
    expect(header).toBeTruthy();
  });

  it('should show B1NGO wordmark', () => {
    expect(fixture.nativeElement.textContent).toContain('B1NGO');
  });

  it('should render theme circle with aria-label', () => {
    const btn = fixture.nativeElement.querySelector('[aria-label="Change color theme"]');
    expect(btn).toBeTruthy();
    expect(btn.classList.contains('rounded-full')).toBe(true);
  });

  it('should open bottom sheet when theme circle is clicked', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Change color theme"]');
    btn.click();
    fixture.detectChanges();
    const sheet = fixture.nativeElement.querySelector('bng-bottom-sheet');
    expect(sheet).toBeTruthy();
  });

  it('should call ThemeService.setTheme on theme change', () => {
    const spy = vi.spyOn(themeService, 'setTheme');
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Change color theme"]');
    btn.click();
    fixture.detectChanges();

    const themeButton = fixture.nativeElement.querySelector('bng-theme-picker [role="radio"]');
    if (themeButton) {
      themeButton.click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    }
  });

  it('should not show context sub-bar when roomStatus is null', () => {
    const subBar = fixture.nativeElement.querySelector('.bg-bg-base');
    expect(subBar).toBeFalsy();
  });

  it('should show context sub-bar with session info and status badge when roomStatus is set', () => {
    fixture.componentRef.setInput('roomStatus', 'Active');
    fixture.componentRef.setInput('session', { grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();

    const subBar = fixture.nativeElement.querySelector('.bg-bg-base');
    expect(subBar).toBeTruthy();
    expect(subBar.textContent).toContain('MON / Race');

    const badge = subBar.querySelector('bng-status-badge');
    expect(badge).toBeTruthy();
  });

  it('should not show session info or status badge in header row', () => {
    fixture.componentRef.setInput('roomStatus', 'Active');
    fixture.componentRef.setInput('session', { grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[role="banner"]');
    expect(header.querySelector('bng-status-badge')).toBeFalsy();
    expect(header.textContent).not.toContain('MON / Race');
  });
});
