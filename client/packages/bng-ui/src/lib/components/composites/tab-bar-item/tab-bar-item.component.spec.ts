import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngTabBarItemComponent } from './tab-bar-item.component';

@Component({
  standalone: true,
  imports: [BngTabBarItemComponent],
  template: `
    <bng-tab-bar-item
      [icon]="icon"
      [label]="label"
      [active]="active()"
      (clicked)="onClicked()"
    >
      <span tabBadge class="badge">3</span>
    </bng-tab-bar-item>
  `,
})
class TestHost {
  icon = '<circle cx="12" cy="12" r="10"/>';
  label = 'Home';
  active = signal(false);
  onClicked = vi.fn();
}

describe('BngTabBarItemComponent', () => {
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

  it('should render icon and label text', () => {
    const icon = fixture.nativeElement.querySelector('bng-icon');
    expect(icon).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Home');
  });

  it('should have text-text-muted class when inactive', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('text-text-muted')).toBe(true);
    expect(button.classList.contains('text-accent')).toBe(false);
  });

  it('should not have aria-current when inactive', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-current')).toBeNull();
  });

  it('should have text-accent class when active', () => {
    host.active.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('text-accent')).toBe(true);
    expect(button.classList.contains('text-text-muted')).toBe(false);
  });

  it('should have aria-current="page" when active', () => {
    host.active.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-current')).toBe('page');
  });

  it('should emit clicked when inactive and clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(host.onClicked).toHaveBeenCalledTimes(1);
  });

  it('should NOT emit clicked when active and clicked', () => {
    host.active.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(host.onClicked).not.toHaveBeenCalled();
  });

  it('should render projected tabBadge content', () => {
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toBe('3');
  });

  it('should have aria-label matching the label text', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Home');
  });

  it('should have focus-visible ring classes for keyboard focus', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.className).toContain('focus-visible:ring-2');
  });
});
