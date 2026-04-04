import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngSquarePopoverComponent, BngSquareComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-square-popover',
  standalone: true,
  imports: [BngSquarePopoverComponent, BngSquareComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Square Popover</h2>
    <p class="text-sm text-text-secondary mb-6">
      Tooltip popover anchored to a bingo square, showing event text and marked-by info.
    </p>

    <div class="space-y-6">
      <bng-card header="Unmarked square">
        <p class="text-xs text-text-secondary mb-3">Click the square to show popover (auto-closes after 5s).</p>
        <div class="grid grid-cols-5 gap-1.5 max-w-[280px]">
          <div #unmarkedEl>
            <bng-square
              displayText="Fastest Lap"
              (inspect)="openPopover('unmarked', $event)"
            />
          </div>
        </div>
        @if (activePopover() === 'unmarked' && anchorEl()) {
          <bng-square-popover
            displayText="Fastest Lap"
            [anchorElement]="anchorEl()!"
            (closed)="closePopover()"
          />
        }
      </bng-card>

      <bng-card header="Marked square">
        <p class="text-xs text-text-secondary mb-3">Click the square to show popover with marked-by info.</p>
        <div class="grid grid-cols-5 gap-1.5 max-w-[280px]">
          <div #markedEl>
            <bng-square
              displayText="Safety Car"
              [isMarked]="true"
              markedByLabel="You"
              markedByVariant="self"
              (inspect)="openPopover('marked', $event)"
            />
          </div>
        </div>
        @if (activePopover() === 'marked' && anchorEl()) {
          <bng-square-popover
            displayText="Safety Car"
            [isMarked]="true"
            markedByLabel="You"
            markedAt="2026-04-04T12:00:00Z"
            [anchorElement]="anchorEl()!"
            (closed)="closePopover()"
          />
        }
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquarePopoverSection {
  readonly activePopover = signal<string | null>(null);
  readonly anchorEl = signal<HTMLElement | null>(null);

  openPopover(id: string, el: HTMLElement): void {
    this.activePopover.set(null);
    setTimeout(() => {
      this.anchorEl.set(el);
      this.activePopover.set(id);
    });
  }

  closePopover(): void {
    this.activePopover.set(null);
    this.anchorEl.set(null);
  }
}
