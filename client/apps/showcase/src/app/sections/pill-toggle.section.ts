import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngPillToggleComponent, BngCardComponent, PillToggleOption } from 'bng-ui';

@Component({
  selector: 'ds-pill-toggle',
  standalone: true,
  imports: [BngPillToggleComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Pill Toggle</h2>
    <p class="text-sm text-text-secondary mb-6">
      Multi-select pill toggles for win patterns and session types.
    </p>

    <div class="space-y-6">
      <bng-card header="Win Patterns">
        <bng-pill-toggle
          ariaLabel="Win patterns"
          [options]="winPatterns()"
          (toggled)="toggleWinPattern($event)"
        />
      </bng-card>

      <bng-card header="Session Types">
        <bng-pill-toggle
          ariaLabel="Session types"
          [options]="sessionTypes()"
          (toggled)="toggleSessionType($event)"
        />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillToggleSection {
  readonly winPatterns = signal<PillToggleOption[]>([
    { value: 'row', label: 'Row', selected: true },
    { value: 'column', label: 'Column', selected: true },
    { value: 'diagonal', label: 'Diagonal', selected: false },
    { value: 'blackout', label: 'Blackout', selected: false },
  ]);

  readonly sessionTypes = signal<PillToggleOption[]>([
    { value: 'practice', label: 'Practice', selected: false },
    { value: 'qualifying', label: 'Qualifying', selected: true },
    { value: 'sprint', label: 'Sprint', selected: false },
    { value: 'race', label: 'Race', selected: true },
  ]);

  toggleWinPattern(value: string): void {
    this.winPatterns.update((opts) =>
      opts.map((o) => (o.value === value ? { ...o, selected: !o.selected } : o)),
    );
  }

  toggleSessionType(value: string): void {
    this.sessionTypes.update((opts) =>
      opts.map((o) => (o.value === value ? { ...o, selected: !o.selected } : o)),
    );
  }
}
