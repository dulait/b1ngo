import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { BngHeaderComponent, BngCardComponent, ToastService } from 'bng-ui';

@Component({
  selector: 'ds-header-section',
  standalone: true,
  imports: [BngHeaderComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Header</h2>
    <p class="text-sm text-text-secondary mb-6">
      App header with room status and session info across Lobby, Active, and Completed states.
    </p>

    <div class="space-y-6">
      <bng-card header="Active">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Active"
          [session]="{ grandPrixShort: 'BHR', sessionType: 'Race' }"
          (helpClicked)="onHelpClicked()"
        />
      </bng-card>

      <bng-card header="Lobby">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Lobby"
          [session]="{ grandPrixShort: 'JPN', sessionType: 'Qualifying' }"
          (helpClicked)="onHelpClicked()"
        />
      </bng-card>

      <bng-card header="Completed">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Completed"
          [session]="{ grandPrixShort: 'MON', sessionType: 'Sprint' }"
          (helpClicked)="onHelpClicked()"
        />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSection {
  private readonly toast = inject(ToastService);

  onHelpClicked(): void {
    this.toast.info('helpClicked fired');
  }
}
