import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { BngMatrixComponent, BngCardComponent, SquareData } from 'bng-ui';

@Component({
  selector: 'ds-matrix',
  standalone: true,
  imports: [BngMatrixComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Matrix</h2>
    <p class="text-sm text-text-secondary mb-6">
      Full 5x5 bingo matrix with mixed states, interactive game mode, and a compact 3x3 variant.
    </p>

    <div class="space-y-6">
      <bng-card header="5x5 Game Mode (interactive)">
        <bng-matrix
          [squares]="gameSquares()"
          [matrixSize]="5"
          mode="game"
          (squareMark)="onMark5x5($event)"
          (squareUnmark)="onUnmark5x5($event)"
        />
      </bng-card>

      <bng-card header="3x3 Compact">
        <bng-matrix [squares]="compactSquares" [matrixSize]="3" mode="game" />
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixSection {
  private readonly f1Items = [
    'Safety Car',
    'DRS enabled',
    'Pit stop under VSC',
    'Overtake into T1',
    'Red flag',
    'Fastest lap set',
    'Penalty issued',
    'Team radio drama',
    'Late braking move',
    'Tyre deg talk',
    'Undercut attempt',
    'Overcut strategy',
    'Rain threat',
    'Gravel trap visit',
    'Formation lap issue',
    'DRS train',
    'Track limits warning',
    'Slipstream pass',
    'Lock-up into corner',
    'Engine mode change',
    'Blue flag shown',
    'SC restart crash',
    'Double stack',
    'Photo finish',
    'Podium celebration',
  ];

  private readonly squares5x5 = signal<SquareData[]>(this.build5x5());

  readonly gameSquares = computed(() => this.squares5x5());

  readonly compactSquares: SquareData[] = [
    {
      row: 0,
      column: 0,
      displayText: 'Safety Car',
      isFreeSpace: false,
      isMarked: true,
      markedBy: 'Player',
    },
    {
      row: 0,
      column: 1,
      displayText: 'DRS enabled',
      isFreeSpace: false,
      isMarked: false,
      markedBy: null,
    },
    {
      row: 0,
      column: 2,
      displayText: 'Pit stop',
      isFreeSpace: false,
      isMarked: true,
      markedBy: 'Host',
    },
    {
      row: 1,
      column: 0,
      displayText: 'Overtake',
      isFreeSpace: false,
      isMarked: false,
      markedBy: null,
    },
    { row: 1, column: 1, displayText: 'FREE', isFreeSpace: true, isMarked: true, markedBy: null },
    {
      row: 1,
      column: 2,
      displayText: 'Red flag',
      isFreeSpace: false,
      isMarked: false,
      markedBy: null,
    },
    {
      row: 2,
      column: 0,
      displayText: 'Fastest lap',
      isFreeSpace: false,
      isMarked: false,
      markedBy: null,
    },
    {
      row: 2,
      column: 1,
      displayText: 'Penalty',
      isFreeSpace: false,
      isMarked: true,
      markedBy: 'Api',
    },
    {
      row: 2,
      column: 2,
      displayText: 'Team radio',
      isFreeSpace: false,
      isMarked: false,
      markedBy: null,
    },
  ];

  onMark5x5(pos: { row: number; column: number }): void {
    this.squares5x5.update((squares) =>
      squares.map((sq) =>
        sq.row === pos.row && sq.column === pos.column
          ? { ...sq, isMarked: true, markedBy: 'Player' as const }
          : sq,
      ),
    );
  }

  onUnmark5x5(pos: { row: number; column: number }): void {
    this.squares5x5.update((squares) =>
      squares.map((sq) =>
        sq.row === pos.row && sq.column === pos.column
          ? { ...sq, isMarked: false, markedBy: null }
          : sq,
      ),
    );
  }

  private build5x5(): SquareData[] {
    const squares: SquareData[] = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) {
          squares.push({
            row: r,
            column: c,
            displayText: 'FREE',
            isFreeSpace: true,
            isMarked: true,
            markedBy: null,
          });
        } else {
          const marked = (r === 0 && c === 1) || (r === 1 && c === 3) || (r === 3 && c === 0);
          const markedBy = marked
            ? r === 0 && c === 1
              ? ('Player' as const)
              : r === 1 && c === 3
                ? ('Host' as const)
                : ('Api' as const)
            : null;
          squares.push({
            row: r,
            column: c,
            displayText: this.f1Items[idx],
            isFreeSpace: false,
            isMarked: marked,
            markedBy,
          });
          idx++;
        }
      }
    }
    return squares;
  }
}
