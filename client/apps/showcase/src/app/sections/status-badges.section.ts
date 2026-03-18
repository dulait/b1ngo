import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngStatusBadgeComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-status-badges',
  standalone: true,
  imports: [BngStatusBadgeComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Status Badges</h2>
    <p class="text-sm text-text-secondary mb-6">
      Room status indicators for Lobby, Active, and Completed states.
    </p>

    <bng-card header="All Statuses">
      <div class="flex flex-wrap items-center gap-4">
        <bng-status-badge status="Lobby" />
        <bng-status-badge status="Active" />
        <bng-status-badge status="Completed" />
      </div>
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgesSection {}
