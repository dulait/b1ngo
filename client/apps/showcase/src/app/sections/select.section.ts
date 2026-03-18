import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngSelectComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-select',
  standalone: true,
  imports: [BngSelectComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Select</h2>
    <p class="text-sm text-text-secondary mb-6">
      Custom themed dropdown with keyboard navigation, type-ahead, and full ARIA support.
    </p>

    <div class="space-y-6">
      <bng-card header="Default">
        <bng-select
          label="Grand Prix"
          [options]="grandPrixOptions"
          [value]="selectedGp()"
          (valueChange)="selectedGp.set($event)"
        />
      </bng-card>

      <bng-card header="With Hint">
        <bng-select
          label="Favourite Circuit"
          [options]="grandPrixOptions"
          placeholder="Choose a race"
          hint="Used for personalised highlights during the session."
        />
      </bng-card>

      <bng-card header="Error State">
        <bng-select
          label="Grand Prix"
          [options]="grandPrixOptions"
          error="Selection is required."
        />
      </bng-card>

      <bng-card header="Disabled">
        <bng-select
          label="Grand Prix"
          [options]="grandPrixOptions"
          value="monaco"
          [disabled]="true"
        />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSection {
  readonly selectedGp = signal('bahrain');

  readonly grandPrixOptions = [
    { value: 'bahrain', label: 'Bahrain Grand Prix' },
    { value: 'saudi', label: 'Saudi Arabian Grand Prix' },
    { value: 'australia', label: 'Australian Grand Prix' },
    { value: 'japan', label: 'Japanese Grand Prix' },
    { value: 'china', label: 'Chinese Grand Prix' },
    { value: 'miami', label: 'Miami Grand Prix' },
    { value: 'monaco', label: 'Monaco Grand Prix' },
    { value: 'spain', label: 'Spanish Grand Prix' },
  ];
}
