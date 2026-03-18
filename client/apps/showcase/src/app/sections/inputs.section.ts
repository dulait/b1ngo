import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngInputComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-inputs',
  standalone: true,
  imports: [BngInputComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Inputs</h2>
    <p class="text-sm text-text-secondary mb-6">
      Text inputs with placeholder, error, and hint states. Select dropdown with F1 Grand Prix
      options.
    </p>

    <div class="space-y-6">
      <bng-card header="Text Input">
        <div class="space-y-4">
          <bng-input
            label="Display Name"
            placeholder="e.g. Max Verstappen"
            hint="This is how other players will see you."
          />
          <bng-input
            label="Display Name"
            placeholder="e.g. Max Verstappen"
            value="LH"
            error="Name must be at least 3 characters."
          />
        </div>
      </bng-card>

      <bng-card header="Select Dropdown">
        <bng-input label="Grand Prix" type="select" [options]="grandPrixOptions" value="bahrain" />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputsSection {
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
