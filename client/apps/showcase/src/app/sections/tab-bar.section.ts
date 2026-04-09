import { Component, ChangeDetectionStrategy, ViewEncapsulation, signal } from '@angular/core';
import {
  BngTabBarComponent,
  BngTabBarItemComponent,
  BngCardComponent,
  bngIconHome,
  bngIconClock,
  bngIconBarChart,
  bngIconUser,
} from 'bng-ui';

type ActiveTab = '/' | '/history' | '/stats' | '/profile';

@Component({
  selector: 'ds-tab-bar',
  standalone: true,
  imports: [BngTabBarComponent, BngTabBarItemComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Tab Bar</h2>
    <p class="text-sm text-text-secondary mb-6">
      Fixed bottom navigation bar with icon + label tabs, active state highlighting, and optional badge slot.
    </p>

    <div class="space-y-6">
      <bng-card header="Interactive demo">
        <div class="space-y-4">
          <!-- Active tab switcher -->
          <div>
            <p class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Active tab</p>
            <div class="flex flex-wrap gap-2">
              @for (tab of tabs; track tab.route) {
                <button
                  type="button"
                  class="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                  [class.border-accent]="activeTab() === tab.route"
                  [class.bg-accent-muted]="activeTab() === tab.route"
                  [class.text-accent]="activeTab() === tab.route"
                  [class.border-border-default]="activeTab() !== tab.route"
                  [class.text-text-secondary]="activeTab() !== tab.route"
                  (click)="activeTab.set(tab.route)"
                >{{ tab.label }}</button>
              }
            </div>
          </div>

          <!-- Badge toggle (per tab) -->
          <div>
            <p class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Badge dot</p>
            <div class="flex flex-wrap gap-2">
              @for (tab of tabs; track tab.route) {
                <button
                  type="button"
                  class="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                  [class.border-accent]="badgeTab() === tab.route"
                  [class.bg-accent-muted]="badgeTab() === tab.route"
                  [class.text-accent]="badgeTab() === tab.route"
                  [class.border-border-default]="badgeTab() !== tab.route"
                  [class.text-text-secondary]="badgeTab() !== tab.route"
                  (click)="toggleBadge(tab.route)"
                >{{ tab.label }}</button>
              }
              <button
                type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                [class.border-accent]="!badgeTab()"
                [class.bg-accent-muted]="!badgeTab()"
                [class.text-accent]="!badgeTab()"
                [class.border-border-default]="badgeTab()"
                [class.text-text-secondary]="badgeTab()"
                (click)="badgeTab.set(null)"
              >None</button>
            </div>
          </div>

          <!-- Inline preview (non-fixed, for showcase scroll context) -->
          <div class="tab-bar-inline border border-border-default rounded-xl">
            <bng-tab-bar>
              <bng-tab-bar-item
                [icon]="homeIcon"
                label="Home"
                [active]="activeTab() === '/'"
                (clicked)="activeTab.set('/')"
              >
                @if (badgeTab() === '/') {
                  <span tabBadge class="block w-2 h-2 rounded-full bg-error"></span>
                }
              </bng-tab-bar-item>
              <bng-tab-bar-item
                [icon]="clockIcon"
                label="History"
                [active]="activeTab() === '/history'"
                (clicked)="activeTab.set('/history')"
              >
                @if (badgeTab() === '/history') {
                  <span tabBadge class="block w-2 h-2 rounded-full bg-error"></span>
                }
              </bng-tab-bar-item>
              <bng-tab-bar-item
                [icon]="chartIcon"
                label="Stats"
                [active]="activeTab() === '/stats'"
                (clicked)="activeTab.set('/stats')"
              >
                @if (badgeTab() === '/stats') {
                  <span tabBadge class="block w-2 h-2 rounded-full bg-error"></span>
                }
              </bng-tab-bar-item>
              <bng-tab-bar-item
                [icon]="userIcon"
                label="Profile"
                [active]="activeTab() === '/profile'"
                (clicked)="activeTab.set('/profile')"
              >
                @if (badgeTab() === '/profile') {
                  <span tabBadge class="block w-2 h-2 rounded-full bg-error"></span>
                }
              </bng-tab-bar-item>
            </bng-tab-bar>
          </div>

          <p class="text-xs text-text-secondary">
            Note: In the showcase, the tab bar is rendered inline. In the real app it is fixed to the bottom of the viewport.
          </p>
        </div>
      </bng-card>
    </div>
  `,
  styles: `
    .tab-bar-inline nav {
      position: relative;
      bottom: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TabBarSection {
  protected readonly homeIcon = bngIconHome;
  protected readonly clockIcon = bngIconClock;
  protected readonly chartIcon = bngIconBarChart;
  protected readonly userIcon = bngIconUser;

  readonly tabs = [
    { label: 'Home', route: '/' as ActiveTab },
    { label: 'History', route: '/history' as ActiveTab },
    { label: 'Stats', route: '/stats' as ActiveTab },
    { label: 'Profile', route: '/profile' as ActiveTab },
  ];

  readonly activeTab = signal<ActiveTab>('/');
  readonly badgeTab = signal<ActiveTab | null>(null);

  protected toggleBadge(route: ActiveTab): void {
    this.badgeTab.set(this.badgeTab() === route ? null : route);
  }
}
