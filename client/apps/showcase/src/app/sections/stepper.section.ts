import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngStepperComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-stepper-section',
  standalone: true,
  imports: [BngStepperComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Stepper</h2>
    <p class="text-sm text-text-secondary mb-6">
      Multi-step traversable content with dot indicators, navigation controls, and slide
      transitions.
    </p>

    <div class="space-y-6">
      <bng-card header="Basic (3 steps)">
        <bng-stepper
          [totalSteps]="3"
          [currentStep]="basicStep()"
          (stepChange)="basicStep.set($event)"
          (skipped)="basicStep.set(0)"
          (completed)="basicStep.set(0)"
        >
          <div class="px-5 py-4">
            @switch (basicStep()) {
              @case (0) {
                <h4 class="text-base font-semibold text-text-primary mb-2">Step 1</h4>
                <p class="text-sm text-text-secondary">Welcome to the first step.</p>
              }
              @case (1) {
                <h4 class="text-base font-semibold text-text-primary mb-2">Step 2</h4>
                <p class="text-sm text-text-secondary">You are on the second step.</p>
              }
              @case (2) {
                <h4 class="text-base font-semibold text-text-primary mb-2">Step 3</h4>
                <p class="text-sm text-text-secondary">Final step. Click Done to finish.</p>
              }
            }
          </div>
        </bng-stepper>
      </bng-card>

      <bng-card header="5 Steps (dot indicators scale)">
        <bng-stepper
          [totalSteps]="5"
          [currentStep]="fiveStep()"
          (stepChange)="fiveStep.set($event)"
          (skipped)="fiveStep.set(0)"
          (completed)="fiveStep.set(0)"
        >
          <div class="px-5 py-4">
            <h4 class="text-base font-semibold text-text-primary mb-2">
              Step {{ fiveStep() + 1 }} of 5
            </h4>
            <p class="text-sm text-text-secondary">
              Content for step {{ fiveStep() + 1 }}.
            </p>
          </div>
        </bng-stepper>
      </bng-card>

      <bng-card header="Without Skip Button">
        <bng-stepper
          [totalSteps]="3"
          [currentStep]="noSkipStep()"
          [showSkip]="false"
          (stepChange)="noSkipStep.set($event)"
          (completed)="noSkipStep.set(0)"
        >
          <div class="px-5 py-4">
            <h4 class="text-base font-semibold text-text-primary mb-2">
              Step {{ noSkipStep() + 1 }}
            </h4>
            <p class="text-sm text-text-secondary">
              This stepper has showSkip set to false.
            </p>
          </div>
        </bng-stepper>
      </bng-card>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperSection {
  readonly basicStep = signal(0);
  readonly fiveStep = signal(0);
  readonly noSkipStep = signal(0);
}
