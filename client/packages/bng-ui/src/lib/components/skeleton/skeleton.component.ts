import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';

const TEXT_LINE_WIDTHS = ['100%', '80%', '60%'] as const;
const DEFAULT_MATRIX_SIZE = 5;
const PLAYER_LIST_ROW_COUNT = 3;

@Component({
  selector: 'bng-skeleton',
  standalone: true,
  template: `
    @switch (variant()) {
      @case ('text') {
        <div aria-hidden="true" class="space-y-2">
          @for (line of textLines(); track $index) {
            <div
              class="bg-bg-surface-hover skeleton-pulse rounded"
              [style.width]="line.width"
              [style.height]="height()"
            ></div>
          }
        </div>
      }
      @case ('circle') {
        <div
          aria-hidden="true"
          class="bg-bg-surface-hover skeleton-pulse rounded-full"
          [style.width]="width()"
          [style.height]="width()"
        ></div>
      }
      @case ('matrix') {
        <div
          aria-hidden="true"
          class="aspect-square grid gap-1"
          [style.gridTemplateColumns]="'repeat(' + matrixSize() + ', 1fr)'"
        >
          @for (i of matrixCells(); track i) {
            <div class="bg-bg-surface-hover skeleton-pulse rounded"></div>
          }
        </div>
      }
      @case ('player-list') {
        <div aria-hidden="true" class="space-y-2">
          @for (i of playerListRows; track i) {
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-bg-surface-hover skeleton-pulse rounded-full shrink-0"></div>
              <div class="bg-bg-surface-hover skeleton-pulse rounded h-4 flex-1"></div>
            </div>
          }
        </div>
      }
      @default {
        <div
          aria-hidden="true"
          class="bg-bg-surface-hover skeleton-pulse rounded-lg"
          [style.width]="width()"
          [style.height]="height()"
        ></div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngSkeletonComponent {
  variant = input<'text' | 'circle' | 'rect' | 'matrix' | 'player-list'>('rect');
  width = input('100%');
  height = input('1rem');
  lines = input(1);
  matrixSize = input(DEFAULT_MATRIX_SIZE);

  protected readonly playerListRows = Array.from({ length: PLAYER_LIST_ROW_COUNT }, (_, i) => i);

  protected matrixCells = computed(() => {
    const size = this.matrixSize();
    return Array.from({ length: size * size }, (_, i) => i);
  });

  protected textLines = computed(() => {
    const count = this.lines();
    return Array.from({ length: count }, (_, i) => ({
      width: TEXT_LINE_WIDTHS[i % TEXT_LINE_WIDTHS.length],
    }));
  });
}
