import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import {
  BngHeaderComponent,
  BngMenuItemComponent,
  BngStatusBadgeComponent,
  BngBottomSheetComponent,
  BngThemePickerComponent,
  BngCardComponent,
  ToastService,
  ThemeService,
  bngIconHelpCircle,
} from 'bng-ui';
import type { ThemeName } from 'bng-ui';

@Component({
  selector: 'ds-header-section',
  standalone: true,
  imports: [
    BngHeaderComponent,
    BngMenuItemComponent,
    BngStatusBadgeComponent,
    BngBottomSheetComponent,
    BngThemePickerComponent,
    BngCardComponent,
  ],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Header</h2>
    <p class="text-sm text-text-secondary mb-6">
      App header with kebab menu. Consumer projects a sub-bar for contextual info.
    </p>

    <div class="space-y-6">
      <bng-card header="With Sub-bar (Active)">
        <bng-header version="v0.1.0" copyright="B1NGO">
          <bng-menu-item
            [icon]="helpIcon"
            label="How to play"
            (clicked)="onHelpClicked()"
          />
          <bng-menu-item
            label="Theme"
            (clicked)="themeSheetOpen.set(true)"
          >
            <span
              menuItemIcon
              class="w-5 h-5 rounded-full"
              [style.backgroundColor]="themeService.accentColor()"
            ></span>
          </bng-menu-item>
          <div headerSubbar class="flex items-center justify-between px-4 py-2 bg-bg-base border-b border-border-default">
            <span class="text-sm text-text-secondary">BHR / Race</span>
            <bng-status-badge status="Active" />
          </div>
        </bng-header>
      </bng-card>

      <bng-card header="With Sub-bar (Lobby)">
        <bng-header version="v0.1.0" copyright="B1NGO">
          <bng-menu-item
            [icon]="helpIcon"
            label="How to play"
            (clicked)="onHelpClicked()"
          />
          <bng-menu-item
            label="Theme"
            (clicked)="themeSheetOpen.set(true)"
          >
            <span
              menuItemIcon
              class="w-5 h-5 rounded-full"
              [style.backgroundColor]="themeService.accentColor()"
            ></span>
          </bng-menu-item>
          <div headerSubbar class="flex items-center justify-between px-4 py-2 bg-bg-base border-b border-border-default">
            <span class="text-sm text-text-secondary">JPN / Qualifying</span>
            <bng-status-badge status="Lobby" />
          </div>
        </bng-header>
      </bng-card>

      <bng-card header="No Sub-bar (Home)">
        <bng-header version="v0.1.0" copyright="B1NGO">
          <bng-menu-item
            [icon]="helpIcon"
            label="How to play"
            (clicked)="onHelpClicked()"
          />
          <bng-menu-item
            label="Theme"
            (clicked)="themeSheetOpen.set(true)"
          >
            <span
              menuItemIcon
              class="w-5 h-5 rounded-full"
              [style.backgroundColor]="themeService.accentColor()"
            ></span>
          </bng-menu-item>
        </bng-header>
      </bng-card>
    </div>

    <bng-bottom-sheet
      title="Theme"
      [open]="themeSheetOpen()"
      (closed)="themeSheetOpen.set(false)"
    >
      <div class="flex justify-center py-2">
        <bng-theme-picker
          [currentTheme]="themeService.currentTheme()"
          (themeChange)="onThemeChange($event)"
        />
      </div>
    </bng-bottom-sheet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSection {
  private readonly toast = inject(ToastService);
  protected readonly themeService = inject(ThemeService);
  protected readonly helpIcon = bngIconHelpCircle;
  protected themeSheetOpen = signal(false);

  onHelpClicked(): void {
    this.toast.info('helpClicked fired');
  }

  onThemeChange(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    setTimeout(() => this.themeSheetOpen.set(false), 150);
  }
}
