import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngStatusBadgeComponent } from './status-badge.component';

describe('BngStatusBadgeComponent', () => {
  let fixture: ComponentFixture<BngStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngStatusBadgeComponent);
    fixture.componentRef.setInput('label', 'Active');
    fixture.componentRef.setInput('variant', 'success');
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

  it('should show pulse-dot animation on success variant', () => {
    const dot = fixture.nativeElement.querySelector('.pulse-dot');
    expect(dot).toBeTruthy();
  });

  it('should show warning label with yellow styling', () => {
    fixture.componentRef.setInput('label', 'Lobby');
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('.bg-yellow-500');
    expect(dot).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Lobby');
  });

  it('should show neutral label with slate styling', () => {
    fixture.componentRef.setInput('label', 'Completed');
    fixture.componentRef.setInput('variant', 'neutral');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('.bg-slate-400');
    expect(dot).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Completed');
  });

  it('should set aria-label', () => {
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el.getAttribute('aria-label')).toBe('Active');
  });
});
