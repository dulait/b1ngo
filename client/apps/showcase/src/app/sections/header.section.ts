import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngHeaderComponent, BngCardComponent } from 'bng-ui';

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
        />
      </bng-card>

      <bng-card header="Lobby">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Lobby"
          [session]="{ grandPrixShort: 'JPN', sessionType: 'Qualifying' }"
        />
      </bng-card>

      <bng-card header="Completed">
        <bng-header
          joinCode="X4K9M2"
          roomStatus="Completed"
          [session]="{ grandPrixShort: 'MON', sessionType: 'Sprint' }"
        />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSection {}
