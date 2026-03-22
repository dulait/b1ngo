import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';
import { BngModalComponent, BngStepperComponent } from 'bng-ui';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [BngModalComponent, BngStepperComponent],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class Tutorial {
  open = input(false);
  closed = output<void>();

  protected readonly step = signal(0);
  protected readonly codeChars = ['A', '7', 'X', '3', 'K', 'R'];
  protected readonly gridCells = Array.from({ length: 9 });

  private readonly step2FreeIndex = 4;
  private readonly step2MarkedIndices = [1, 2, 6];
  private readonly diagonalIndices = [0, 4, 8];

  onClose(): void {
    this.step.set(0);
    this.closed.emit();
  }

  protected getStep2CellClass(_index: number): string {
    return 'bg-border-default';
  }

  protected getStep2CellStyle(index: number): string {
    const cascadeDelay = index * 100;
    const cascade = `tutorial-cell-in 200ms ease-out ${cascadeDelay}ms forwards`;

    if (index === this.step2FreeIndex) {
      return `animation: ${cascade}, tutorial-free 300ms ease-out 1000ms forwards`;
    }
    if (this.step2MarkedIndices.includes(index)) {
      const markDelay = 1300 + this.step2MarkedIndices.indexOf(index) * 200;
      return `animation: ${cascade}, tutorial-mark 300ms ease-out ${markDelay}ms forwards`;
    }
    return `animation: ${cascade}`;
  }

  protected getStep3CellClass(index: number): string {
    if (this.diagonalIndices.includes(index)) {
      return 'bg-accent tutorial-glow-anim';
    }
    return 'bg-border-default';
  }

  protected getStep3CellStyle(index: number): string {
    if (this.diagonalIndices.includes(index)) {
      const staggerIndex = this.diagonalIndices.indexOf(index);
      return `animation-delay: ${500 + staggerIndex * 150}ms`;
    }
    return '';
  }
}
