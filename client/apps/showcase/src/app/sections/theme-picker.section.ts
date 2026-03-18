import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { BngThemePickerComponent, BngCardComponent, ThemeService, ThemeName } from 'bng-ui';

@Component({
  selector: 'ds-theme-picker',
  standalone: true,
  imports: [BngThemePickerComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Theme Picker</h2>
    <p class="text-sm text-text-secondary mb-6">
      Live theme switcher. All sections react in real-time to theme changes.
    </p>

    <bng-card header="Select Theme">
      <bng-theme-picker
        [currentTheme]="themeService.currentTheme()"
        (themeChange)="onThemeChange($event)"
      />
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePickerSection {
  protected readonly themeService = inject(ThemeService);

  onThemeChange(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }
}
