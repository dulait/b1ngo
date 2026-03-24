import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  BngModalComponent,
  BngStepperComponent,
  BngButtonComponent,
  BngCardComponent,
} from 'bng-ui';

@Component({
  selector: 'ds-modal-stepper-section',
  standalone: true,
  imports: [
    BngModalComponent,
    BngStepperComponent,
    BngButtonComponent,
    BngCardComponent,
  ],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Modal + Stepper</h2>
    <p class="text-sm text-text-secondary mb-6">
      Composition pattern: a modal containing a stepper with animated tutorial cards. This is the
      pattern the tutorial feature will use.
    </p>

    <bng-card header="Tutorial Flow">
      <bng-button variant="primary" (clicked)="open()">Open Tutorial</bng-button>
    </bng-card>

    <bng-modal [open]="modalOpen()" maxWidth="md" (closed)="onClose()">
      <bng-stepper
        [totalSteps]="4"
        [currentStep]="step()"
        (stepChange)="step.set($event)"
        (skipped)="onClose()"
        (completed)="onClose()"
      >
        <div class="px-6 pt-6 pb-2">
          @switch (step()) {
            @case (0) {
              <div class="h-36 rounded-lg mb-4 relative overflow-hidden bg-bg-surface-hover">
                <div class="absolute inset-0 flex items-center justify-center tutorial-wordmark-anim">
                  <span class="text-3xl font-mono font-bold text-accent">B1NGO</span>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">Welcome to B1NGO</h3>
              <p class="text-sm text-text-secondary">
                F1-themed bingo you play with friends during live race sessions.
              </p>
            }
            @case (1) {
              <div class="h-36 rounded-lg mb-4 relative overflow-hidden bg-bg-surface-hover">
                <div class="absolute inset-0 flex items-center justify-center gap-1.5">
                  @for (char of codeChars; track $index) {
                    <div
                      class="w-9 h-11 rounded-md border border-border-default bg-bg-surface flex items-center justify-center"
                    >
                      <span
                        class="text-base font-mono font-bold text-accent tutorial-char-anim"
                        [style.animation-delay]="($index * 300) + 'ms'"
                      >{{ char }}</span>
                    </div>
                  }
                </div>
              </div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">Create or Join</h3>
              <p class="text-sm text-text-secondary">
                One player creates a room and shares the join code. Friends enter the code to join.
              </p>
            }
            @case (2) {
              <div class="h-36 rounded-lg mb-4 relative overflow-hidden bg-bg-surface-hover">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="grid grid-cols-3 gap-1.5">
                    @for (cell of gridCells; track $index) {
                      <div
                        class="w-8 h-8 rounded-md opacity-0"
                        [class]="getStep2CellClass($index)"
                        [style]="getStep2CellStyle($index)"
                      ></div>
                    }
                  </div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">Mark Your Card</h3>
              <p class="text-sm text-text-secondary">
                Tap squares as F1 events happen during the session. The center square is always
                free.
              </p>
            }
            @case (3) {
              <div class="h-36 rounded-lg mb-4 relative overflow-hidden bg-bg-surface-hover">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="relative">
                    <div class="grid grid-cols-3 gap-1.5">
                      @for (cell of gridCells; track $index) {
                        <div
                          class="w-8 h-8 rounded-md"
                          [class]="getStep3CellClass($index)"
                          [style]="getStep3CellStyle($index)"
                        ></div>
                      }
                    </div>
                    <div
                      class="absolute -bottom-6 left-1/2 -translate-x-1/2 tutorial-bingo-anim"
                    >
                      <span class="text-sm font-mono font-bold text-accent whitespace-nowrap">
                        BINGO!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">Score a Bingo</h3>
              <p class="text-sm text-text-secondary">
                Complete a row, column, or diagonal to win. Multiple players can win, ranked by
                speed.
              </p>
            }
          }
        </div>
      </bng-stepper>
    </bng-modal>
  `,
  styles: `
    .tutorial-wordmark-anim {
      opacity: 0;
      animation: tutorial-wordmark-fade 600ms ease-out forwards;
    }

    @keyframes tutorial-wordmark-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    .tutorial-char-anim {
      opacity: 0;
      animation: tutorial-char-in 200ms ease-out forwards;
    }

    .tutorial-glow-anim {
      animation: tutorial-glow 400ms ease-out forwards;
    }

    .tutorial-bingo-anim {
      opacity: 0;
      animation: tutorial-bingo-text 300ms ease-out forwards;
      animation-delay: 1400ms;
    }

    @keyframes tutorial-char-in {
      0%   { opacity: 0; transform: scale(1.3); }
      60%  { opacity: 1; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes tutorial-cell-in {
      0%   { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes tutorial-mark {
      0%   { background-color: var(--bng-color-border-default); transform: scale(1); }
      40%  { background-color: var(--bng-color-accent); transform: scale(1.15); }
      100% { background-color: var(--bng-color-accent); transform: scale(1); }
    }

    @keyframes tutorial-free {
      0%   { background-color: var(--bng-color-border-default); }
      100% { background-color: var(--bng-color-accent); opacity: 0.5; }
    }

    @keyframes tutorial-glow {
      0%   { box-shadow: 0 0 0 0 transparent; }
      50%  { box-shadow: 0 0 0 3px var(--bng-color-accent); }
      100% { box-shadow: 0 0 0 1px var(--bng-color-accent); }
    }

    @keyframes tutorial-bingo-text {
      0%   { opacity: 0; transform: scale(0.8) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .tutorial-wordmark-anim {
        animation: none;
        opacity: 1;
      }
      .tutorial-char-anim {
        animation: none;
        opacity: 1;
      }
      .tutorial-glow-anim {
        animation: none;
        box-shadow: 0 0 0 1px var(--bng-color-accent);
      }
      .tutorial-bingo-anim {
        animation: none;
        opacity: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ModalStepperSection {
  readonly modalOpen = signal(false);
  readonly step = signal(0);

  protected readonly codeChars = ['A', '7', 'X', '3', 'K', 'R'];
  protected readonly gridCells = Array.from({ length: 9 });

  private readonly step2FreeIndex = 4;
  private readonly step2MarkedIndices = [1, 2, 6];
  private readonly diagonalIndices = [0, 4, 8];

  open(): void {
    this.step.set(0);
    this.modalOpen.set(true);
  }

  onClose(): void {
    this.modalOpen.set(false);
  }

  protected getStep2CellClass(_index: number): string {
    return 'bg-border-default';
  }

  protected getStep2CellStyle(index: number): string {
    const cascadeDelay = index * 100;
    const cascade = `tutorial-cell-in 200ms ease-out ${cascadeDelay}ms forwards`;

    if (index === this.step2FreeIndex) {
      return `animation: ${cascade}, tutorial-free 300ms ease-out 1000ms forwards`;
    }
    if (this.step2MarkedIndices.includes(index)) {
      const markDelay = 1300 + this.step2MarkedIndices.indexOf(index) * 200;
      return `animation: ${cascade}, tutorial-mark 300ms ease-out ${markDelay}ms forwards`;
    }
    return `animation: ${cascade}`;
  }

  protected getStep3CellClass(index: number): string {
    if (this.diagonalIndices.includes(index)) {
      return 'bg-accent tutorial-glow-anim';
    }
    return 'bg-border-default';
  }

  protected getStep3CellStyle(index: number): string {
    if (this.diagonalIndices.includes(index)) {
      const staggerIndex = this.diagonalIndices.indexOf(index);
      return `animation-delay: ${500 + staggerIndex * 150}ms`;
    }
    return '';
  }
}
