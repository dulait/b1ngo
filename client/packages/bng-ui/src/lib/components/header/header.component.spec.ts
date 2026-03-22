import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngHeaderComponent } from './header.component';
import { BngMenuItemComponent } from '../menu-item/menu-item.component';
import { bngIconHelpCircle } from '../../icons/icons';

@Component({
  standalone: true,
  imports: [BngHeaderComponent, BngMenuItemComponent],
  template: `
    <bng-header
      [joinCode]="joinCode()"
      [roomStatus]="roomStatus()"
      [session]="session()"
      [version]="version()"
    >
      <bng-menu-item [icon]="helpIcon" label="How to play" />
      <bng-menu-item label="Theme">
        <span menuItemIcon class="theme-dot"></span>
      </bng-menu-item>
    </bng-header>
  `,
})
class TestHost {
  joinCode = signal<string | null>(null);
  roomStatus = signal<'Lobby' | 'Active' | 'Completed' | null>(null);
  session = signal<{ grandPrixShort: string; sessionType: string } | null>(null);
  version = signal<string | null>(null);
  helpIcon = bngIconHelpCircle;
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

  it('should not show context sub-bar when roomStatus is null', () => {
    const subBar = fixture.nativeElement.querySelector('[data-testid="header-session-bar"]');
    expect(subBar).toBeFalsy();
  });

  it('should show context sub-bar with session info and status badge when roomStatus is set', () => {
    host.roomStatus.set('Active');
    host.session.set({ grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();

    const subBar = fixture.nativeElement.querySelector('[data-testid="header-session-bar"]');
    expect(subBar).toBeTruthy();
    expect(subBar.textContent).toContain('MON / Race');

    const badge = subBar.querySelector('bng-status-badge');
    expect(badge).toBeTruthy();
  });

  it('should not show session info or status badge in header row', () => {
    host.roomStatus.set('Active');
    host.session.set({ grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[role="banner"]');
    expect(header.querySelector('bng-status-badge')).toBeFalsy();
    expect(header.textContent).not.toContain('MON / Race');
  });
});
