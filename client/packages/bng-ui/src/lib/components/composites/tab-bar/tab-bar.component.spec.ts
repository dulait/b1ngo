import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngTabBarComponent } from './tab-bar.component';

@Component({
  standalone: true,
  imports: [BngTabBarComponent],
  template: `
    <bng-tab-bar>
      <span class="child-item">Tab 1</span>
    </bng-tab-bar>
  `,
})
class TestHost {}

describe('BngTabBarComponent', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('should render a nav element with role="navigation"', () => {
    const nav = fixture.nativeElement.querySelector('nav[role="navigation"]');
    expect(nav).toBeTruthy();
  });

  it('should have aria-label "Main navigation"', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should project child content', () => {
    const child = fixture.nativeElement.querySelector('.child-item');
    expect(child).toBeTruthy();
    expect(child.textContent).toBe('Tab 1');
  });

  it('should have fixed bottom positioning classes', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.classList.contains('fixed')).toBe(true);
    expect(nav.classList.contains('bottom-0')).toBe(true);
  });

  it('should have safe-area bottom padding class', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.className).toContain('pb-[env(safe-area-inset-bottom)]');
  });
});
