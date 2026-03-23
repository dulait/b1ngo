import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { BngButtonComponent } from '../button/button.component';

type SlideDirection = 'none' | 'left' | 'right';

@Component({
  selector: 'bng-stepper',
  standalone: true,
  imports: [BngButtonComponent],
  template: `
    <div
      class="overflow-hidden relative"
      role="tabpanel"
      [attr.aria-label]="'Step ' + (currentStep() + 1) + ' of ' + totalSteps()"
    >
      <div
        class="w-full will-change-transform"
        [style.animation]="contentAnimation()"
        (animationend)="onAnimationEnd()"
      >
        <ng-content />
      </div>
    </div>

    <div
      class="flex justify-center gap-2 py-3"
      role="tablist"
      aria-label="Step progress"
    >
      @for (step of steps(); track $index; let i = $index) {
        <button
          role="tab"
          [attr.aria-selected]="i === currentStep()"
          [attr.aria-label]="'Step ' + (i + 1) + ' of ' + totalSteps()"
          [tabindex]="i === currentStep() ? 0 : -1"
          class="w-2 h-2 rounded-full transition-colors duration-150"
          [class.bg-accent]="i === currentStep()"
          [class.bg-border-default]="i !== currentStep()"
          (click)="goToStep(i)"
          (keydown)="onDotsKeydown($event)"
        ></button>
      }
    </div>

    <div class="px-5 pb-5 pt-2 flex justify-between items-center">
      <div class="min-w-[48px]">
        @if (showSkip() && !isLastStep()) {
          <button
            class="text-sm text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Skip"
            (click)="onSkip()"
          >
            Skip
          </button>
        }
      </div>

      <div class="flex items-center gap-2">
        @if (!isFirstStep()) {
          <bng-button variant="secondary" size="sm" aria-label="Previous step" (clicked)="onBack()">
            Back
          </bng-button>
        }
        @if (isLastStep()) {
          <bng-button variant="primary" size="sm" aria-label="Done" (clicked)="onDone()">
            Done
          </bng-button>
        } @else {
          <bng-button variant="primary" size="sm" aria-label="Next step" (clicked)="onNext()">
            Next
          </bng-button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngStepperComponent {
  totalSteps = input.required<number>();
  currentStep = input(0);
  showSkip = input(true);

  stepChange = output<number>();
  skipped = output<void>();
  completed = output<void>();

  protected readonly slideDirection = signal<SlideDirection>('none');
  protected readonly animatingOut = signal(false);
  private pendingStep: number | null = null;

  protected steps = computed(() => Array.from({ length: this.totalSteps() }));

  protected isFirstStep = computed(() => this.currentStep() === 0);
  protected isLastStep = computed(() => this.currentStep() === this.totalSteps() - 1);

  protected contentAnimation = computed(() => {
    const dir = this.slideDirection();
    if (dir === 'none') {
      return 'none';
    }
    if (this.animatingOut()) {
      return dir === 'left'
        ? 'stepper-slide-out-left 250ms cubic-bezier(0.32, 0.72, 0, 1) forwards'
        : 'stepper-slide-out-right 250ms cubic-bezier(0.32, 0.72, 0, 1) forwards';
    }
    return dir === 'left'
      ? 'stepper-slide-in-left 250ms cubic-bezier(0.32, 0.72, 0, 1)'
      : 'stepper-slide-in-right 250ms cubic-bezier(0.32, 0.72, 0, 1)';
  });

  protected onNext(): void {
    const next = this.currentStep() + 1;
    if (next < this.totalSteps()) {
      this.slideDirection.set('left');
      this.animatingOut.set(true);
      this.pendingStep = next;
    }
  }

  protected onBack(): void {
    const prev = this.currentStep() - 1;
    if (prev >= 0) {
      this.slideDirection.set('right');
      this.animatingOut.set(true);
      this.pendingStep = prev;
    }
  }

  protected goToStep(index: number): void {
    if (index === this.currentStep()) {
      return;
    }
    this.slideDirection.set(index > this.currentStep() ? 'left' : 'right');
    this.animatingOut.set(true);
    this.pendingStep = index;
  }

  protected onSkip(): void {
    this.skipped.emit();
  }

  protected onDone(): void {
    this.completed.emit();
  }

  protected onAnimationEnd(): void {
    if (this.animatingOut()) {
      this.animatingOut.set(false);
      if (this.pendingStep !== null) {
        this.stepChange.emit(this.pendingStep);
        this.pendingStep = null;
      }
    } else {
      this.slideDirection.set('none');
    }
  }

  protected onDotsKeydown(event: KeyboardEvent): void {
    const step = this.currentStep();
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (step < this.totalSteps() - 1) {
        this.goToStep(step + 1);
      }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (step > 0) {
        this.goToStep(step - 1);
      }
    }
  }
}
