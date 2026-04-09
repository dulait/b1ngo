import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import {
  BngHeaderComponent,
  BngMenuItemComponent,
  BngBottomSheetComponent,
  BngThemePickerComponent,
  BngToastContainerComponent,
  BngTabBarComponent,
  BngTabBarItemComponent,
  ThemeService,
  ToastService,
  bngIconHelpCircle,
  bngIconUser,
  bngIconLogIn,
  bngIconSignOut,
  bngIconClock,
  bngIconBarChart,
  bngIconHome,
} from 'bng-ui';
import type { ThemeName } from 'bng-ui';
import { ENVIRONMENT } from './core/environment/environment.token';
import { AuthService } from '@core/auth/auth.service';
import { SessionService } from '@core/auth/session.service';
import { StorageService } from '@core/storage/storage.service';
import { safeAsync } from '@core/utils/safe-async.util';
import { TutorialComponent } from '@shell/index';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BngHeaderComponent,
    BngMenuItemComponent,
    BngBottomSheetComponent,
    BngThemePickerComponent,
    BngToastContainerComponent,
    BngTabBarComponent,
    BngTabBarItemComponent,
    TutorialComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly storage = inject(StorageService);
  readonly themeService = inject(ThemeService);
  protected readonly helpIcon = bngIconHelpCircle;
  protected readonly userIcon = bngIconUser;
  protected readonly logInIcon = bngIconLogIn;
  protected readonly signOutIcon = bngIconSignOut;
  protected readonly clockIcon = bngIconClock;
  protected readonly barChartIcon = bngIconBarChart;
  protected readonly homeIcon = bngIconHome;
  readonly version = `v${inject(ENVIRONMENT).version}`;
  readonly tutorialOpen = signal(false);
  readonly themeSheetOpen = signal(false);
  readonly showHeader = signal(true);
  readonly showTabBar = signal(true);
  private readonly keyboardOpen = signal(false);
  readonly currentRoute = signal('/');
  readonly isRoomRoute = signal(false);
  readonly tabBarVisible = computed(() => this.showTabBar() && !this.keyboardOpen());
  readonly homeAriaLabel = computed(() =>
    this.auth.isAuthenticated() ? 'Back to dashboard' : 'Back to home',
  );
  readonly isHomeActive = computed(() => this.currentRoute() === '/');
  readonly isHistoryActive = computed(() => this.currentRoute().startsWith('/history'));
  readonly isStatsActive = computed(() => this.currentRoute().startsWith('/stats'));
  readonly isProfileActive = computed(() => this.currentRoute().startsWith('/profile'));

  ngOnInit(): void {
    this.themeService.initialize();
    this.setupKeyboardDetection();

    if (!this.storage.getString('bng-tutorial-completed')) {
      this.tutorialOpen.set(true);
    }

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.showHeader.set(!this.hasRouteData(this.route, 'hideHeader'));
        this.showTabBar.set(!this.hasRouteData(this.route, 'hideTabBar'));
        this.currentRoute.set(e.urlAfterRedirects.split('?')[0]);
        this.isRoomRoute.set(e.urlAfterRedirects.startsWith('/room'));
      });
  }

  openTutorial(): void {
    this.tutorialOpen.set(true);
  }

  closeTutorial(): void {
    this.tutorialOpen.set(false);
    this.storage.set('bng-tutorial-completed', 'true');
  }

  async onSignOut(): Promise<void> {
    await safeAsync(this.auth.logout());
    this.session.clearSession();
    this.toast.info('Signed out.');
    // canMatch won't re-run on same-URL navigation, so route through wildcard to force re-matching
    await this.router.navigateByUrl('/_', { skipLocationChange: true });
  }

  onHomeClicked(): void {
    const state = this.isRoomRoute() ? { fromRoom: true } : undefined;
    this.router.navigate(['/'], { state });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  protected onTabNavigate(route: string): void {
    this.router.navigate([route]);
  }

  onThemeChange(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    setTimeout(() => this.themeSheetOpen.set(false), 150);
  }

  private setupKeyboardDetection(): void {
    document.addEventListener('focusin', (e) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        this.keyboardOpen.set(true);
      }
    });
    document.addEventListener('focusout', () => {
      this.keyboardOpen.set(false);
    });
  }

  private hasRouteData(route: ActivatedRoute, key: string): boolean {
    let current: ActivatedRoute | null = route;
    while (current) {
      if (current.snapshot.data[key]) {
        return true;
      }
      current = current.firstChild;
    }
    return false;
  }
}
