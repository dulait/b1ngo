import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  BngHeaderComponent,
  BngMenuItemComponent,
  BngBottomSheetComponent,
  BngThemePickerComponent,
  BngToastContainerComponent,
  ThemeService,
  bngIconHelpCircle,
} from 'bng-ui';
import type { ThemeName } from 'bng-ui';
import { ENVIRONMENT } from './core/environment';
import { Tutorial } from './features/tutorial/tutorial';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BngHeaderComponent,
    BngMenuItemComponent,
    BngBottomSheetComponent,
    BngThemePickerComponent,
    BngToastContainerComponent,
    Tutorial,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly helpIcon = bngIconHelpCircle;
  readonly version = `v${inject(ENVIRONMENT).version}`;
  readonly tutorialOpen = signal(false);
  readonly themeSheetOpen = signal(false);

  ngOnInit(): void {
    this.themeService.initialize();

    if (!localStorage.getItem('bng-tutorial-completed')) {
      this.tutorialOpen.set(true);
    }
  }

  openTutorial(): void {
    this.tutorialOpen.set(true);
  }

  closeTutorial(): void {
    this.tutorialOpen.set(false);
    localStorage.setItem('bng-tutorial-completed', 'true');
  }

  onThemeChange(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    setTimeout(() => this.themeSheetOpen.set(false), 150);
  }
}
