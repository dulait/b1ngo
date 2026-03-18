import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  BngIconComponent,
  BngCardComponent,
  bngIconCopy,
  bngIconShare,
  bngIconChevronDown,
  bngIconCheck,
  bngIconCheckFilled,
  bngIconCrown,
  bngIconTrophy,
  bngIconStar,
  bngIconZap,
  bngIconPencil,
  bngIconX,
  bngIconSpinner,
  bngIconInfoCircle,
  bngIconCheckCircle,
  bngIconAlertTriangle,
  bngIconXCircle,
} from 'bng-ui';

interface IconEntry {
  name: string;
  icon: string;
  viewBox?: string;
}

@Component({
  selector: 'ds-icons',
  standalone: true,
  imports: [BngIconComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Icons</h2>
    <p class="text-sm text-text-secondary mb-6">
      All 16 icons rendered at xs, sm, md, and lg sizes.
    </p>

    <bng-card header="Icon Grid">
      <div class="grid grid-cols-4 gap-4">
        @for (entry of icons; track entry.name) {
          <div class="flex flex-col items-center gap-2 py-2">
            <div class="flex items-center gap-2">
              @for (size of sizes; track size) {
                <bng-icon
                  [icon]="entry.icon"
                  [size]="size"
                  [viewBox]="entry.viewBox ?? '0 0 24 24'"
                />
              }
            </div>
            <span class="text-[10px] text-text-secondary text-center">{{ entry.name }}</span>
          </div>
        }
      </div>
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconsSection {
  readonly sizes = ['xs', 'sm', 'md', 'lg'] as const;

  readonly icons: IconEntry[] = [
    { name: 'Copy', icon: bngIconCopy },
    { name: 'Share', icon: bngIconShare },
    { name: 'Chevron Down', icon: bngIconChevronDown },
    { name: 'Check', icon: bngIconCheck },
    { name: 'Check Filled', icon: bngIconCheckFilled, viewBox: '0 0 14 14' },
    { name: 'Crown', icon: bngIconCrown },
    { name: 'Trophy', icon: bngIconTrophy },
    { name: 'Star', icon: bngIconStar },
    { name: 'Zap', icon: bngIconZap },
    { name: 'Pencil', icon: bngIconPencil },
    { name: 'X', icon: bngIconX },
    { name: 'Spinner', icon: bngIconSpinner },
    { name: 'Info Circle', icon: bngIconInfoCircle },
    { name: 'Check Circle', icon: bngIconCheckCircle },
    { name: 'Alert Triangle', icon: bngIconAlertTriangle },
    { name: 'X Circle', icon: bngIconXCircle },
  ];
}
