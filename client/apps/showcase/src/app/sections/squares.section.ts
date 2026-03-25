import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngSquareComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-squares',
  standalone: true,
  imports: [BngSquareComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Squares</h2>
    <p class="text-sm text-text-secondary mb-6">
      Individual bingo square states and interactive toggling.
    </p>

    <div class="space-y-6">
      <bng-card header="All States">
        <div class="grid grid-cols-4 gap-2" style="max-width: 320px">
          <bng-square displayText="Unmarked" />
          <bng-square displayText="Marked (You)" [isMarked]="true" markedByLabel="You" markedByVariant="self" />
          <bng-square displayText="Marked (Host)" [isMarked]="true" markedByLabel="Host" markedByVariant="other" />
          <bng-square displayText="Marked (Auto)" [isMarked]="true" markedByLabel="Auto" markedByVariant="other" />
          <bng-square displayText="FREE" [isFreeSpace]="true" />
          <bng-square displayText="Editable" [isEditable]="true" />
          <bng-square
            displayText="Winning!"
            [isMarked]="true"
            markedByLabel="You"
            markedByVariant="self"
            [isWinning]="true"
          />
          <bng-square displayText="Markable" [isMarkable]="true" />
        </div>
      </bng-card>

      <bng-card header="Interactive (Tap to Toggle)">
        <p class="text-xs text-text-secondary mb-3">Tap to toggle mark/unmark.</p>
        <div class="grid grid-cols-3 gap-2" style="max-width: 240px">
          @for (sq of interactiveSquares(); track $index) {
            <bng-square
              [displayText]="sq.text"
              [isMarked]="sq.marked"
              [markedByLabel]="sq.marked ? 'You' : null"
              [markedByVariant]="sq.marked ? 'self' : null"
              [isMarkable]="!sq.marked"
              (mark)="toggleSquare($index)"
              (unmark)="toggleSquare($index)"
            />
          }
        </div>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquaresSection {
  readonly interactiveSquares = signal([
    { text: 'Safety Car', marked: false },
    { text: 'DRS enabled', marked: true },
    { text: 'Pit stop', marked: false },
    { text: 'Overtake', marked: false },
    { text: 'Yellow flag', marked: true },
    { text: 'Fastest lap', marked: false },
  ]);

  toggleSquare(index: number): void {
    this.interactiveSquares.update((squares) =>
      squares.map((sq, i) => (i === index ? { ...sq, marked: !sq.marked } : sq)),
    );
  }
}
