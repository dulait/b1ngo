import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BngSkeletonComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-skeletons',
  standalone: true,
  imports: [BngSkeletonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Skeletons</h2>
    <p class="text-sm text-text-secondary mb-6">
      Loading placeholders in five variants: text, rect, circle, matrix, and player-list.
    </p>

    <div class="space-y-6">
      <bng-card header="Text (3 lines)">
        <bng-skeleton variant="text" [lines]="3" />
      </bng-card>

      <bng-card header="Rectangle">
        <bng-skeleton variant="rect" width="100%" height="80px" />
      </bng-card>

      <bng-card header="Circle">
        <bng-skeleton variant="circle" width="48px" />
      </bng-card>

      <bng-card header="Matrix">
        <bng-skeleton variant="matrix" />
      </bng-card>

      <bng-card header="Player List">
        <bng-skeleton variant="player-list" />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonsSection {}
