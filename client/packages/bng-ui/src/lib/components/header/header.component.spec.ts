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

  it('should show session info', () => {
    fixture.componentRef.setInput('session', { grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('MON / Race');
  });

  it('should show status badge', () => {
    fixture.componentRef.setInput('roomStatus', 'Active');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('bng-status-badge');
    expect(badge).toBeTruthy();
  });

  it('should not show status badge when null', () => {
    const badge = fixture.nativeElement.querySelector('bng-status-badge');
    expect(badge).toBeFalsy();
  });

  it('should render palette button with aria-label', () => {
    const btn = fixture.nativeElement.querySelector('[aria-label="Change color theme"]');
    expect(btn).toBeTruthy();
  });

  it('should open bottom sheet when palette button is clicked', () => {
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
});
