import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
  signal,
  inject,
} from '@angular/core';
import { BngStatusBadgeComponent } from '../status-badge/status-badge.component';
import { BngBottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { BngThemePickerComponent } from '../theme-picker/theme-picker.component';
import { ThemeService } from '../../services/theme.service';
import { SessionDto, ThemeName } from '../../types';

@Component({
  selector: 'bng-header',
  standalone: true,
  imports: [BngStatusBadgeComponent, BngBottomSheetComponent, BngThemePickerComponent],
  template: `
    <header
      role="banner"
      data-testid="app-header"
      [attr.aria-label]="ariaLabel()"
      class="h-14 flex items-center justify-between px-4 bg-bg-surface border-b border-border-default pt-[env(safe-area-inset-top)]"
    >
      <span class="font-mono font-bold text-lg text-accent" data-testid="app-logo">B1NGO</span>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          role="button"
          data-testid="theme-button"
          class="w-6 h-6 rounded-full cursor-pointer hover:ring-2 hover:ring-white/30 transition-all"
          [style.backgroundColor]="themeService.accentColor()"
          aria-label="Change color theme"
          (click)="themeSheetOpen.set(true)"
        ></button>
      </div>
    </header>

    @if (roomStatus()) {
      <div data-testid="header-session-bar" class="flex items-center justify-between px-4 py-2 bg-bg-base border-b border-border-default">
        <span class="text-sm text-text-secondary" data-testid="header-session-info">
          {{ session()!.grandPrixShort }} / {{ session()!.sessionType }}
        </span>
        <bng-status-badge [status]="roomStatus()!" />
      </div>
    }

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
  encapsulation: ViewEncapsulation.None,
})
export class BngHeaderComponent {
  joinCode = input<string | null>(null);
  roomStatus = input<'Lobby' | 'Active' | 'Completed' | null>(null);
  session = input<SessionDto | null>(null);

  protected readonly themeService = inject(ThemeService);
  protected themeSheetOpen = signal(false);

  protected ariaLabel = computed(() => {
    const parts: string[] = [];
    if (this.joinCode()) {
      parts.push(`Room ${this.joinCode()}`);
    }
    if (this.roomStatus()) {
      parts.push(this.roomStatus()!);
    }
    const s = this.session();
    if (s) {
      parts.push(`${s.grandPrixShort} / ${s.sessionType}`);
    }
    return parts.join(', ');
  });

  protected onThemeChange(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    setTimeout(() => this.themeSheetOpen.set(false), 150);
  }
}
