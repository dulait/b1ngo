import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngBannerComponent } from './banner.component';
import { BannerVariant } from '../../../types/types';

@Component({
  standalone: true,
  imports: [BngBannerComponent],
  template: `
    <bng-banner
      [variant]="variant()"
      [dismissible]="dismissible()"
      (dismissed)="onDismissed()"
    >
      <p>Test message</p>
      <button bannerAction>Action</button>
    </bng-banner>
  `,
})
class TestHost {
  variant = signal<BannerVariant>('accent');
  dismissible = signal(true);
  onDismissed = vi.fn();
}

describe('BngBannerComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render projected message content', () => {
    expect(fixture.nativeElement.textContent).toContain('Test message');
  });

  it('should render projected bannerAction content', () => {
    expect(fixture.nativeElement.textContent).toContain('Action');
  });

  it('should default to accent variant', () => {
    const root = fixture.nativeElement.querySelector('[role="status"]');
    expect(root.classList).toContain('border-accent');
    expect(root.classList).toContain('bg-accent-muted');
  });

  it('should apply error variant classes', () => {
    host.variant.set('error');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[role="status"]');
    expect(root.classList).toContain('border-error');
    expect(root.classList).toContain('bg-error-muted');
    expect(root.classList).not.toContain('border-accent');
    expect(root.classList).not.toContain('bg-accent-muted');
  });

  it('should show dismiss button by default', () => {
    const btn = fixture.nativeElement.querySelector('bng-icon-button');
    expect(btn).toBeTruthy();
  });

  it('should hide dismiss button when dismissible is false', () => {
    host.dismissible.set(false);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('bng-icon-button');
    expect(btn).toBeFalsy();
  });

  it('should emit dismissed when dismiss button is clicked', () => {
    const btn = fixture.nativeElement.querySelector('bng-icon-button button');
    btn.click();
    expect(host.onDismissed).toHaveBeenCalledOnce();
  });

  it('should have role status on root element', () => {
    const root = fixture.nativeElement.querySelector('[role="status"]');
    expect(root).toBeTruthy();
  });

  it('should have aria-label Dismiss on dismiss button', () => {
    const btn = fixture.nativeElement.querySelector('bng-icon-button button');
    expect(btn.getAttribute('aria-label')).toBe('Dismiss');
  });
});
