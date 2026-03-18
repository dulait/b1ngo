import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-cards',
  standalone: true,
  imports: [BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Cards</h2>
    <p class="text-sm text-text-secondary mb-6">
      Container cards with optional header and content projection.
    </p>

    <div class="space-y-6">
      <bng-card header="Card with Header">
        <p class="text-sm text-text-secondary">
          This card has a header and projected content. Use cards to group related UI elements
          together.
        </p>
      </bng-card>

      <bng-card>
        <p class="text-sm text-text-secondary">
          This card has no header. Content is projected directly into the card body.
        </p>
      </bng-card>

      <bng-card header="Card with Actions">
        <p class="text-sm text-text-secondary mb-3">
          This card demonstrates content projection with an action area.
        </p>
        <div card-actions class="flex gap-2 pt-3 border-t border-border-subtle">
          <span class="text-xs text-text-secondary">Bahrain GP / Race</span>
          <span class="text-xs text-accent ml-auto">4 players</span>
        </div>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsSection {}
