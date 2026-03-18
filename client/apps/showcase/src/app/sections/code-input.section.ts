import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngCodeInputComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-code-input',
  standalone: true,
  imports: [BngCodeInputComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Code Input</h2>
    <p class="text-sm text-text-secondary mb-6">
      Six-character join code in input mode and display mode, plus error state.
    </p>

    <div class="space-y-6">
      <bng-card header="Input Mode (empty)">
        <bng-code-input mode="input" />
      </bng-card>

      <bng-card header="Display Mode">
        <bng-code-input mode="display" value="X4K9M2" />
      </bng-card>

      <bng-card header="Error State">
        <bng-code-input mode="input" error="Room not found. Check the code and try again." />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeInputSection {}
