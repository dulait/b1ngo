/*
 * Public API Surface of bng-ui
 */

// Components
export { BngButtonComponent } from './lib/components/button/button.component';
export { BngInputComponent } from './lib/components/input/input.component';
export { BngCodeInputComponent } from './lib/components/code-input/code-input.component';
export { BngSquareComponent } from './lib/components/square/square.component';
export { BngMatrixComponent } from './lib/components/matrix/matrix.component';
export { BngCardComponent } from './lib/components/card/card.component';
export { BngPlayerChipComponent } from './lib/components/player-chip/player-chip.component';
export { BngPlayerListComponent } from './lib/components/player-list/player-list.component';
export { BngLeaderboardComponent } from './lib/components/leaderboard/leaderboard.component';
export { BngHeaderComponent } from './lib/components/header/header.component';
export { BngStatusBadgeComponent } from './lib/components/status-badge/status-badge.component';
export { BngToastContainerComponent } from './lib/components/toast/toast.component';
export { BngBottomSheetComponent } from './lib/components/bottom-sheet/bottom-sheet.component';
export { BngThemePickerComponent } from './lib/components/theme-picker/theme-picker.component';
export { BngSkeletonComponent } from './lib/components/skeleton/skeleton.component';
export { BngPillToggleComponent } from './lib/components/pill-toggle/pill-toggle.component';
export { BngSquarePopoverComponent } from './lib/components/square-popover/square-popover.component';
export type { PillToggleOption } from './lib/components/pill-toggle/pill-toggle.component';

// Icons
export { BngIconComponent } from './lib/icons/icon.component';
export * from './lib/icons/icons';

// Services
export { ToastService } from './lib/services/toast.service';
export { ThemeService } from './lib/services/theme.service';

// Types
export type {
  SquareData,
  PlayerDto,
  LeaderboardEntryDto,
  SessionDto,
  ToastVariant,
  ToastData,
  ThemeName,
  ThemeDefinition,
  MarkedBySource,
} from './lib/types';

export {
  THEMES,
  AVATAR_COLORS,
  FREE_SPACE_LABEL,
  getAvatarColor,
  getAvatarInitials,
  formatMarkedByLabel,
  formatRelativeTime,
} from './lib/types';
