/*
 * Public API Surface of bng-ui
 */

// Primitives
export { BngButtonComponent } from './lib/components/primitives/button/button.component';
export { BngIconComponent } from './lib/components/primitives/icon/icon.component';
export { BngIconButtonComponent } from './lib/components/primitives/icon-button/icon-button.component';
export { BngInputComponent } from './lib/components/primitives/input/input.component';
export { BngSkeletonComponent } from './lib/components/primitives/skeleton/skeleton.component';
export { BngStatusBadgeComponent } from './lib/components/primitives/status-badge/status-badge.component';
export { BngSquareComponent } from './lib/components/primitives/square/square.component';
export { BngPlayerChipComponent } from './lib/components/primitives/player-chip/player-chip.component';

// Composites
export { BngCardComponent } from './lib/components/composites/card/card.component';
export { BngCodeInputComponent } from './lib/components/composites/code-input/code-input.component';
export { BngCollapsibleComponent } from './lib/components/composites/collapsible/collapsible.component';
export { BngHeaderComponent } from './lib/components/composites/header/header.component';
export { BngMenuComponent } from './lib/components/composites/menu/menu.component';
export { BngMenuItemComponent } from './lib/components/composites/menu-item/menu-item.component';
export { BngModalComponent } from './lib/components/composites/modal/modal.component';
export { BngPillToggleComponent } from './lib/components/composites/pill-toggle/pill-toggle.component';
export type { PillToggleOption } from './lib/components/composites/pill-toggle/pill-toggle.component';
export { BngSelectComponent } from './lib/components/composites/select/select.component';
export { BngStepperComponent } from './lib/components/composites/stepper/stepper.component';
export { BngThemePickerComponent } from './lib/components/composites/theme-picker/theme-picker.component';
export { BngBottomSheetComponent } from './lib/components/composites/bottom-sheet/bottom-sheet.component';
export { BngToastContainerComponent } from './lib/components/composites/toast/toast.component';
export { BngMatrixComponent } from './lib/components/composites/matrix/matrix.component';
export { BngSquarePopoverComponent } from './lib/components/composites/square-popover/square-popover.component';
export { BngPlayerListComponent } from './lib/components/composites/player-list/player-list.component';
export { BngLeaderboardComponent } from './lib/components/composites/leaderboard/leaderboard.component';
export { BngBannerComponent } from './lib/components/composites/banner/banner.component';
export { BngStatusPageComponent } from './lib/components/composites/status-page/status-page.component';
export { BngTabBarComponent } from './lib/components/composites/tab-bar/tab-bar.component';
export { BngTabBarItemComponent } from './lib/components/composites/tab-bar-item/tab-bar-item.component';

// Pipes
export { BngFormatDurationPipe } from './lib/pipes/format-duration.pipe';

// Icons (SVG path data)
export * from './lib/icons/icons';

// Services
export { ToastService } from './lib/services/toast.service';
export { ThemeService } from './lib/services/theme.service';

// Types
export type {
  GridCellData,
  PlayerChipItem,
  LeaderboardItem,
  BadgeVariant,
  BannerVariant,
  ToastVariant,
  ToastData,
  ThemeName,
  ThemeDefinition,
} from './lib/types';

export {
  THEMES,
  AVATAR_COLORS,
  FREE_SPACE_LABEL,
  formatDuration,
  getAvatarColor,
  getAvatarInitials,
  formatRelativeTime,
} from './lib/types';
