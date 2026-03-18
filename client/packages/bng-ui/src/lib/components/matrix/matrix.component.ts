import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { BngSquareComponent } from '../square/square.component';
import { BngSquarePopoverComponent } from '../square-popover/square-popover.component';
import { SquareData, FREE_SPACE_LABEL } from '../../types';

@Component({
  selector: 'bng-matrix',
  standalone: true,
  imports: [BngSquareComponent, BngSquarePopoverComponent],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <div
      #gridEl
      role="grid"
      [attr.aria-label]="'Bingo card, ' + matrixSize() + ' by ' + matrixSize()"
      class="aspect-square w-full max-w-[420px] mx-auto relative"
      [style.display]="'grid'"
      [style.gridTemplateColumns]="'repeat(' + matrixSize() + ', 1fr)'"
      [class.gap-1]="matrixSize() <= 5"
      [class.gap-0.5]="matrixSize() > 5"
      (keydown)="onGridKeydown($event)"
    >
      @for (row of rows(); track rowIdx; let rowIdx = $index) {
        <div role="row" class="contents">
          @for (square of row; track colIdx; let colIdx = $index) {
            <bng-square
              [displayText]="square.isFreeSpace ? freeSpaceLabel : square.displayText"
              [isFreeSpace]="square.isFreeSpace"
              [isMarked]="square.isMarked"
              [markedBy]="square.markedBy"
              [isEditable]="mode() === 'lobby'"
              [isMarkable]="mode() === 'game' && !square.isFreeSpace && !square.isMarked"
              [isWinning]="winningSquares().has(square.row + ',' + square.column)"
              [matrixSize]="matrixSize()"
              (mark)="squareMark.emit({ row: square.row, column: square.column })"
              (unmark)="squareUnmark.emit({ row: square.row, column: square.column })"
              (edit)="squareEdit.emit({ row: square.row, column: square.column })"
              (inspect)="onSquareInspect(square, $event)"
            />
          }
        </div>
      }
    </div>

    @if (inspectedSquare() && inspectedAnchor()) {
      <bng-square-popover
        [displayText]="inspectedSquare()!.displayText"
        [isFreeSpace]="inspectedSquare()!.isFreeSpace"
        [isMarked]="inspectedSquare()!.isMarked"
        [markedBy]="inspectedSquare()!.markedBy"
        [markedAt]="inspectedSquare()!.markedAt ?? null"
        [anchorElement]="inspectedAnchor()!"
        (closed)="onPopoverClosed()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngMatrixComponent {
  squares = input<SquareData[]>([]);
  matrixSize = input(5);
  mode = input<'lobby' | 'game' | 'results'>('game');
  currentPlayerId = input('');
  winningSquares = input<Set<string>>(new Set());

  squareMark = output<{ row: number; column: number }>();
  squareUnmark = output<{ row: number; column: number }>();
  squareEdit = output<{ row: number; column: number }>();

  protected readonly freeSpaceLabel = FREE_SPACE_LABEL;
  protected readonly inspectedSquare = signal<SquareData | null>(null);
  protected readonly inspectedAnchor = signal<HTMLElement | null>(null);

  private readonly gridEl = viewChild<ElementRef<HTMLElement>>('gridEl');
  private readonly focusedRow = signal(0);
  private readonly focusedCol = signal(0);

  protected rows = computed(() => {
    const size = this.matrixSize();
    const all = this.squares();
    const result: SquareData[][] = [];
    for (let r = 0; r < size; r++) {
      result.push(all.filter((s) => s.row === r).sort((a, b) => a.column - b.column));
    }
    return result;
  });

  protected onGridKeydown(event: KeyboardEvent): void {
    const size = this.matrixSize();
    let row = this.focusedRow();
    let col = this.focusedCol();

    switch (event.key) {
      case 'ArrowRight':
        col = Math.min(col + 1, size - 1);
        break;
      case 'ArrowLeft':
        col = Math.max(col - 1, 0);
        break;
      case 'ArrowDown':
        row = Math.min(row + 1, size - 1);
        break;
      case 'ArrowUp':
        row = Math.max(row - 1, 0);
        break;
      case 'Home':
        if (event.ctrlKey) {
          row = 0;
          col = 0;
        } else {
          col = 0;
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          row = size - 1;
          col = size - 1;
        } else {
          col = size - 1;
        }
        break;
      default:
        return;
    }

    event.preventDefault();
    this.focusedRow.set(row);
    this.focusedCol.set(col);
    this.focusCell(row, col);
  }

  protected onSquareInspect(square: SquareData, anchorEl: HTMLElement): void {
    this.inspectedSquare.set(square);
    this.inspectedAnchor.set(anchorEl);
  }

  protected onPopoverClosed(): void {
    this.inspectedSquare.set(null);
    this.inspectedAnchor.set(null);
  }

  private focusCell(row: number, col: number): void {
    const grid = this.gridEl()?.nativeElement;
    if (!grid) {
      return;
    }
    const cells = grid.querySelectorAll<HTMLElement>('[role="gridcell"]');
    const index = row * this.matrixSize() + col;
    cells[index]?.focus();
  }
}
