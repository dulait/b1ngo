import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngHeaderComponent } from './header.component';
import { BngMenuItemComponent } from '../menu-item/menu-item.component';
import { bngIconHelpCircle } from '../../../icons/icons';

@Component({
  standalone: true,
  imports: [BngHeaderComponent, BngMenuItemComponent],
  template: `
    <bng-header
      [version]="version()"
      [copyright]="copyright()"
      [homeAriaLabel]="homeAriaLabel()"
      (homeClicked)="onHomeClicked()"
    >
      <bng-menu-item [icon]="helpIcon" label="How to play" />
      <bng-menu-item label="Theme">
        <span menuItemIcon class="theme-dot"></span>
      </bng-menu-item>
      @if (showSubbar()) {
        <div headerSubbar class="test-subbar">Sub-bar content</div>
      }
    </bng-header>
  `,
})
class TestHost {
  version = signal<string | null>(null);
  copyright = signal<string | null>(null);
  homeAriaLabel = signal<string | null>(null);
  showSubbar = signal(false);
  helpIcon = bngIconHelpCircle;
  onHomeClicked = vi.fn();
}

describe('BngHeaderComponent', () => {
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

  it('should create', () => {
    expect(fixture.nativeElement.querySelector('bng-header')).toBeTruthy();
  });

  it('should have role banner', () => {
    const header = fixture.nativeElement.querySelector('[role="banner"]');
    expect(header).toBeTruthy();
  });

  it('should show B1NGO wordmark', () => {
    expect(fixture.nativeElement.textContent).toContain('B1NGO');
  });

  it('should render kebab icon button', () => {
    const btn = fixture.nativeElement.querySelector('[aria-label="Menu"]');
    expect(btn).toBeTruthy();
  });

  it('should open menu when kebab is clicked', () => {
    const btn: HTMLElement = fixture.nativeElement.querySelector('bng-icon-button');
    btn.click();
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
  });

  it('should project menu items into menu', () => {
    const btn: HTMLElement = fixture.nativeElement.querySelector('bng-icon-button');
    btn.click();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
  });

  it('should render version footer when provided', () => {
    host.version.set('v0.1.0');
    fixture.detectChanges();
    const btn: HTMLElement = fixture.nativeElement.querySelector('bng-icon-button');
    btn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('v0.1.0');
  });

  it('should project subbar content when provided', () => {
    host.showSubbar.set(true);
    fixture.detectChanges();
    const subbar = fixture.nativeElement.querySelector('.test-subbar');
    expect(subbar).toBeTruthy();
    expect(subbar.textContent).toContain('Sub-bar content');
  });

  it('should not show subbar when not projected', () => {
    const subbar = fixture.nativeElement.querySelector('.test-subbar');
    expect(subbar).toBeFalsy();
  });

  it('should render wordmark as span when homeAriaLabel is null', () => {
    const banner = fixture.nativeElement.querySelector('[role="banner"]');
    const span = banner.querySelector('span.font-mono');
    expect(span).toBeTruthy();
    expect(span.tagName).toBe('SPAN');
  });

  it('should render wordmark as anchor when homeAriaLabel is set', () => {
    host.homeAriaLabel.set('Back to dashboard');
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('[role="banner"]');
    const link = banner.querySelector('a[aria-label="Back to dashboard"]');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
  });

  it('should emit homeClicked when wordmark link is clicked', () => {
    host.homeAriaLabel.set('Back to home');
    fixture.detectChanges();
    const link: HTMLElement = fixture.nativeElement.querySelector('a[aria-label="Back to home"]');
    link.click();
    expect(host.onHomeClicked).toHaveBeenCalledOnce();
  });

  it('should prevent default on wordmark link click', () => {
    host.homeAriaLabel.set('Back to home');
    fixture.detectChanges();
    const link: HTMLElement = fixture.nativeElement.querySelector('a[aria-label="Back to home"]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
