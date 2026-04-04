import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  BngIconButtonComponent,
  BngCardComponent,
  bngIconX,
  bngIconKebab,
  bngIconUser,
  bngIconPencil,
  bngIconCopy,
  bngIconShare,
} from 'bng-ui';

@Component({
  selector: 'ds-icon-button',
  standalone: true,
  imports: [BngIconButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Icon Button</h2>
    <p class="text-sm text-text-secondary mb-6">
      Transparent button rendering a single icon, available in default and small sizes.
    </p>

    <div class="space-y-6">
      <bng-card header="Default size">
        <div class="flex flex-wrap items-center gap-2">
          @for (item of icons; track item.label) {
            <bng-icon-button [icon]="item.icon" [ariaLabel]="item.label" />
          }
        </div>
      </bng-card>

      <bng-card header="Small size">
        <div class="flex flex-wrap items-center gap-2">
          @for (item of icons; track item.label) {
            <bng-icon-button [icon]="item.icon" [ariaLabel]="item.label" size="sm" />
          }
        </div>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonSection {
  readonly icons = [
    { icon: bngIconX, label: 'Close' },
    { icon: bngIconKebab, label: 'More' },
    { icon: bngIconUser, label: 'Profile' },
    { icon: bngIconPencil, label: 'Edit' },
    { icon: bngIconCopy, label: 'Copy' },
    { icon: bngIconShare, label: 'Share' },
  ];
}
