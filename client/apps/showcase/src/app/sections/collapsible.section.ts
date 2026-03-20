import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngCollapsibleComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-collapsible',
  standalone: true,
  imports: [BngCollapsibleComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Collapsible</h2>
    <p class="text-sm text-text-secondary mb-6">
      Disclosure toggle with chevron animation, optional badge count, and projected content.
    </p>

    <div class="space-y-6">
      <bng-card header="Default (collapsed)">
        <bng-collapsible label="Settings">
          <p class="text-sm text-text-secondary">Hidden content revealed on expand.</p>
        </bng-collapsible>
      </bng-card>

      <bng-card header="Expanded">
        <bng-collapsible label="Details" [(expanded)]="detailsExpanded">
          <p class="text-sm text-text-secondary">This section starts expanded.</p>
        </bng-collapsible>
      </bng-card>

      <bng-card header="With badge">
        <bng-collapsible label="Players" [badge]="playerCount()">
          <p class="text-sm text-text-secondary">Shows a count next to the label.</p>
        </bng-collapsible>
      </bng-card>

      <bng-card header="Without badge">
        <bng-collapsible label="Advanced options">
          <p class="text-sm text-text-secondary">No badge, just a label and chevron.</p>
        </bng-collapsible>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSection {
  readonly detailsExpanded = signal(true);
  readonly playerCount = signal(4);
}
