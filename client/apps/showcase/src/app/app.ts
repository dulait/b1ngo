import { Component, inject, OnInit, signal } from '@angular/core';
import { ThemeService } from 'bng-ui';
import { BngToastContainerComponent } from 'bng-ui';
import { ButtonsSection } from './sections/buttons.section';
import { InputsSection } from './sections/inputs.section';
import { SelectSection } from './sections/select.section';
import { CodeInputSection } from './sections/code-input.section';
import { SquaresSection } from './sections/squares.section';
import { MatrixSection } from './sections/matrix.section';
import { CardsSection } from './sections/cards.section';
import { PlayerChipsSection } from './sections/player-chips.section';
import { PlayerListSection } from './sections/player-list.section';
import { LeaderboardSection } from './sections/leaderboard.section';
import { HeaderSection } from './sections/header.section';
import { StatusBadgesSection } from './sections/status-badges.section';
import { ToastsSection } from './sections/toasts.section';
import { BottomSheetSection } from './sections/bottom-sheet.section';
import { ThemePickerSection } from './sections/theme-picker.section';
import { SkeletonsSection } from './sections/skeletons.section';
import { IconsSection } from './sections/icons.section';
import { PillToggleSection } from './sections/pill-toggle.section';
import { CollapsibleSection } from './sections/collapsible.section';
import { ModalSection } from './sections/modal.section';
import { StepperSection } from './sections/stepper.section';
import { ModalStepperSection } from './sections/modal-stepper.section';
import { StatusPageSection } from './sections/status-page.section';
import { BannerSection } from './sections/banner.section';
import { IconButtonSection } from './sections/icon-button.section';
import { MenuSection } from './sections/menu.section';
import { SquarePopoverSection } from './sections/square-popover.section';
import { TabBarSection } from './sections/tab-bar.section';

@Component({
  selector: 'ds-root',
  standalone: true,
  imports: [
    BngToastContainerComponent,
    ButtonsSection,
    InputsSection,
    SelectSection,
    CodeInputSection,
    SquaresSection,
    MatrixSection,
    CardsSection,
    PlayerChipsSection,
    PlayerListSection,
    LeaderboardSection,
    HeaderSection,
    StatusBadgesSection,
    ToastsSection,
    BottomSheetSection,
    ThemePickerSection,
    SkeletonsSection,
    IconsSection,
    PillToggleSection,
    CollapsibleSection,
    ModalSection,
    StepperSection,
    ModalStepperSection,
    StatusPageSection,
    BannerSection,
    IconButtonSection,
    MenuSection,
    TabBarSection,
    SquarePopoverSection,
  ],
  template: `
    <div class="min-h-screen bg-bg-base text-text-primary">
      <!-- Mobile top bar -->
      <header
        class="lg:hidden fixed top-0 left-0 right-0 h-12 bg-bg-surface border-b border-border-default flex items-center px-4 z-40"
      >
        <button
          (click)="sidebarOpen.set(!sidebarOpen())"
          class="text-text-secondary hover:text-text-primary p-1"
          [attr.aria-expanded]="sidebarOpen()"
          aria-label="Toggle navigation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            @if (sidebarOpen()) {
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            } @else {
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            }
          </svg>
        </button>
        <span class="font-mono font-bold text-sm text-accent ml-3">B1NGO</span>
        <span class="text-xs text-text-secondary ml-2">Design System</span>
      </header>

      <!-- Backdrop (mobile) -->
      @if (sidebarOpen()) {
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div
          class="lg:hidden fixed inset-0 bg-black/50 z-40"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Sidebar -->
      <nav
        class="fixed left-0 top-0 bottom-0 w-[220px] bg-bg-surface border-r border-border-default overflow-y-auto p-4 z-50 transition-transform duration-250 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <h1 class="font-mono font-bold text-lg text-accent mb-1">B1NGO</h1>
        <p class="text-xs text-text-secondary mb-6">Design System</p>
        <ul class="space-y-1">
          @for (item of sections; track item.id) {
            <li>
              <a
                [href]="'#' + item.id"
                class="block text-sm text-text-secondary hover:text-text-primary py-1.5 px-2 rounded hover:bg-bg-surface-hover transition-colors"
                (click)="sidebarOpen.set(false)"
                >{{ item.label }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <!-- Main content -->
      <main class="lg:ml-[220px] pt-14 lg:pt-0 flex-1 p-4 lg:p-6 space-y-12 max-w-3xl">
        <ds-theme-picker id="theme-picker" />
        <ds-buttons id="buttons" />
        <ds-inputs id="inputs" />
        <ds-select id="select" />
        <ds-code-input id="code-input" />
        <ds-squares id="squares" />
        <ds-matrix id="matrix" />
        <ds-cards id="cards" />
        <ds-player-chips id="player-chips" />
        <ds-player-list id="player-list" />
        <ds-leaderboard id="leaderboard" />
        <ds-header-section id="header" />
        <ds-status-badges id="status-badges" />
        <ds-toasts id="toasts" />
        <ds-bottom-sheet-section id="bottom-sheet" />
        <ds-skeletons id="skeletons" />
        <ds-pill-toggle id="pill-toggle" />
        <ds-collapsible id="collapsible" />
        <ds-modal-section id="modal" />
        <ds-stepper-section id="stepper" />
        <ds-modal-stepper-section id="modal-stepper" />
        <ds-status-page id="status-page" />
        <ds-banner id="banner" />
        <ds-icon-button id="icon-button" />
        <ds-menu id="menu" />
        <ds-tab-bar id="tab-bar" />
        <ds-square-popover id="square-popover" />
        <ds-icons id="icons" />
        <div class="h-32"></div>
      </main>

      <bng-toast-container />
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  readonly sidebarOpen = signal(false);

  readonly sections = [
    { id: 'theme-picker', label: 'Theme Picker' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'select', label: 'Select' },
    { id: 'code-input', label: 'Code Input' },
    { id: 'squares', label: 'Squares' },
    { id: 'matrix', label: 'Matrix' },
    { id: 'cards', label: 'Cards' },
    { id: 'player-chips', label: 'Player Chips' },
    { id: 'player-list', label: 'Player List' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'header', label: 'Header' },
    { id: 'status-badges', label: 'Status Badges' },
    { id: 'toasts', label: 'Toasts' },
    { id: 'bottom-sheet', label: 'Bottom Sheet' },
    { id: 'skeletons', label: 'Skeletons' },
    { id: 'pill-toggle', label: 'Pill Toggle' },
    { id: 'collapsible', label: 'Collapsible' },
    { id: 'modal', label: 'Modal' },
    { id: 'stepper', label: 'Stepper' },
    { id: 'modal-stepper', label: 'Modal + Stepper' },
    { id: 'status-page', label: 'Status Page' },
    { id: 'banner', label: 'Banner' },
    { id: 'icon-button', label: 'Icon Button' },
    { id: 'menu', label: 'Menu' },
    { id: 'tab-bar', label: 'Tab Bar' },
    { id: 'square-popover', label: 'Square Popover' },
    { id: 'icons', label: 'Icons' },
  ];

  ngOnInit(): void {
    this.themeService.initialize();
  }
}
