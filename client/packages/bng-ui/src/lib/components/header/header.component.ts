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
import { BngIconComponent } from '../../icons/icon.component';
import { BngBottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { BngThemePickerComponent } from '../theme-picker/theme-picker.component';
import { bngIconPalette } from '../../icons/icons';
import { ThemeService } from '../../services/theme.service';
import { SessionDto } from '../../types';

@Component({
  selector: 'bng-header',
  standalone: true,
  imports: [BngStatusBadgeComponent, BngIconComponent, BngBottomSheetComponent, BngThemePickerComponent],
  template: `
    <header
      role="banner"
      [attr.aria-label]="ariaLabel()"
      class="h-14 flex items-center justify-between px-4 bg-bg-surface border-b border-border-default pt-[env(safe-area-inset-top)]"
    >
      <span class="font-mono font-bold text-lg text-accent">B1NGO</span>

      @if (session()) {
        <span class="text-sm text-text-secondary truncate mx-3">
          {{ session()!.grandPrixShort }} / {{ session()!.sessionType }}
        </span>
      }

      <div class="flex items-center gap-2">
        @if (roomStatus()) {
          <bng-status-badge [status]="roomStatus()!" />
        }

        <button
          type="button"
          class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          aria-label="Change color theme"
          (click)="themeSheetOpen.set(true)"
        >
          <bng-icon [icon]="paletteIcon" size="md" />
        </button>
      </div>
    </header>

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

  protected readonly paletteIcon = bngIconPalette;
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

  protected onThemeChange(theme: string): void {
    this.themeService.setTheme(theme);
    setTimeout(() => this.themeSheetOpen.set(false), 150);
  }
}
