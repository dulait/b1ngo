import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { THEMES, ThemeName } from '../../types';

@Component({
  selector: 'bng-theme-picker',
  standalone: true,
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <div
      role="radiogroup"
      aria-label="Color theme"
      class="flex flex-wrap gap-3 justify-center"
      (keydown)="onKeydown($event)"
    >
      @for (theme of themes; track theme.name) {
        <button
          role="radio"
          [attr.data-testid]="'theme-option-' + theme.name"
          [attr.aria-checked]="theme.name === currentTheme()"
          [attr.aria-label]="theme.label"
          class="flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
          [attr.tabindex]="theme.name === currentTheme() ? 0 : -1"
          (click)="selectTheme(theme.name)"
        >
          <div
            class="w-8 h-8 rounded-full transition-all"
            [style.backgroundColor]="theme.accent"
            [class.ring-2]="theme.name === currentTheme()"
            [class.ring-offset-2]="theme.name === currentTheme()"
            [class.ring-offset-bg-surface]="theme.name === currentTheme()"
            [class.ring-white]="theme.name === currentTheme()"
          ></div>
          <span class="text-xs text-text-secondary">{{ theme.label }}</span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngThemePickerComponent {
  currentTheme = input<ThemeName>('crimson');
  themeChange = output<ThemeName>();

  protected readonly themes = THEMES;

  protected selectTheme(name: ThemeName): void {
    this.themeChange.emit(name);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const isPrev = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!isNext && !isPrev) {
      return;
    }

    event.preventDefault();
    const names = this.themes.map((t) => t.name);
    const currentIdx = names.indexOf(this.currentTheme());
    const newIdx = isNext
      ? (currentIdx + 1) % names.length
      : (currentIdx - 1 + names.length) % names.length;
    this.selectTheme(names[newIdx]);
  }
}
