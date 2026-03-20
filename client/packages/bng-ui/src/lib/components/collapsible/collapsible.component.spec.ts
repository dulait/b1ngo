import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngCollapsibleComponent } from './collapsible.component';

@Component({
  standalone: true,
  imports: [BngCollapsibleComponent],
  template: `
    <bng-collapsible [label]="label()" [badge]="badge()" [(expanded)]="expanded">
      <p>Projected content</p>
    </bng-collapsible>
  `,
})
class TestHost {
  label = signal('Players');
  badge = signal<string | number | null>(null);
  expanded = signal(false);
}

describe('BngCollapsibleComponent', () => {
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

  it('should render label text', () => {
    expect(fixture.nativeElement.textContent).toContain('Players');
  });

  it('should render badge when provided', () => {
    host.badge.set(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('(5)');
  });

  it('should omit badge when null', () => {
    expect(fixture.nativeElement.textContent).not.toContain('(');
  });

  it('should start collapsed by default', () => {
    expect(host.expanded()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
  });

  it('should toggle expanded state on click', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(host.expanded()).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(host.expanded()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
  });

  it('should set aria-expanded to reflect current state', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-controls matching content region id', () => {
    const button = fixture.nativeElement.querySelector('button');
    const controlsId = button.getAttribute('aria-controls');
    expect(controlsId).toMatch(/^bng-collapsible-\d+$/);

    button.click();
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]');
    expect(region.id).toBe(controlsId);
  });

  it('should set role="region" and aria-label on content', () => {
    host.expanded.set(true);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]');
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-label')).toBe('Players');
  });

  it('should not render content when collapsed', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Projected content');
  });

  it('should have rotate-180 class on chevron when expanded', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.classList.contains('rotate-180')).toBe(false);

    host.expanded.set(true);
    fixture.detectChanges();

    expect(svg.classList.contains('rotate-180')).toBe(true);
  });
});
