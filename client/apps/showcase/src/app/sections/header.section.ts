import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import {
  BngHeaderComponent,
  BngMenuItemComponent,
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
    BngBottomSheetComponent,
    BngThemePickerComponent,
    BngCardComponent,
  ],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Header</h2>
    <p class="text-sm text-text-secondary mb-6">
      App header with kebab menu, room status, and session info across Lobby, Active, and Completed states.
    </p>

    <div class="space-y-6">
      <bng-card header="Active">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Active"
          [session]="{ grandPrixShort: 'BHR', sessionType: 'Race' }"
          version="v0.1.0"
        >
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

      <bng-card header="Lobby">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Lobby"
          [session]="{ grandPrixShort: 'JPN', sessionType: 'Qualifying' }"
          version="v0.1.0"
        >
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

      <bng-card header="Completed">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Completed"
          [session]="{ grandPrixShort: 'MON', sessionType: 'Sprint' }"
          version="v0.1.0"
        >
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
