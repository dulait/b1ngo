import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeName, THEMES } from '../types';

const STORAGE_KEY = 'bng-theme';
const DEFAULT_THEME: ThemeName = 'crimson';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly currentTheme = signal<ThemeName>(this.loadTheme());
  readonly accentColor = computed(() => {
    const theme = THEMES.find((t) => t.name === this.currentTheme());
    return theme?.accent ?? THEMES[0].accent;
  });
  readonly themes = THEMES;

  setTheme(theme: ThemeName): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  initialize(): void {
    this.applyTheme(this.currentTheme());
  }

  private loadTheme(): ThemeName {
    if (!this.isBrowser) {
      return DEFAULT_THEME;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some((t) => t.name === stored)) {
      return stored as ThemeName;
    }
    return DEFAULT_THEME;
  }

  private applyTheme(theme: ThemeName): void {
    if (!this.isBrowser) {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }
}
