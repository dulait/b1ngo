import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngStatusBadgeComponent } from './status-badge.component';

describe('BngStatusBadgeComponent', () => {
  let fixture: ComponentFixture<BngStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'Active');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have role status', () => {
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el).toBeTruthy();
  });

  it('should show Active with green styling', () => {
    const dot = fixture.nativeElement.querySelector('.bg-green-500');
    expect(dot).toBeTruthy();
    const text = fixture.nativeElement.querySelector('.text-green-500');
    expect(text.textContent.trim()).toBe('Active');
  });

  it('should show pulse-dot animation on Active', () => {
    const dot = fixture.nativeElement.querySelector('.pulse-dot');
    expect(dot).toBeTruthy();
  });

  it('should show Lobby with yellow styling', () => {
    fixture.componentRef.setInput('status', 'Lobby');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('.bg-yellow-500');
    expect(dot).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Lobby');
  });

  it('should show Completed with slate styling', () => {
    fixture.componentRef.setInput('status', 'Completed');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('.bg-slate-400');
    expect(dot).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Completed');
  });

  it('should set aria-label', () => {
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el.getAttribute('aria-label')).toBe('Room status: Active');
  });
});
