import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngMatrixComponent } from './matrix.component';
import { SquareData } from '../../types';

function createSquares(size: number): SquareData[] {
  const squares: SquareData[] = [];
  const center = Math.floor(size / 2);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      squares.push({
        row: r,
        column: c,
        displayText: `R${r}C${c}`,
        isFreeSpace: r === center && c === center,
        isMarked: false,
        markedBy: null,
      });
    }
  }
  return squares;
}

describe('BngMatrixComponent', () => {
  let fixture: ComponentFixture<BngMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngMatrixComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngMatrixComponent);
    fixture.componentRef.setInput('squares', createSquares(5));
    fixture.componentRef.setInput('matrixSize', 5);
    fixture.componentRef.setInput('winningSquares', new Set<string>());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have role grid', () => {
    const grid = fixture.nativeElement.querySelector('[role="grid"]');
    expect(grid).toBeTruthy();
  });

  it('should render 25 squares for 5x5', () => {
    const squares = fixture.nativeElement.querySelectorAll('bng-square');
    expect(squares.length).toBe(25);
  });

  it('should set aria-label', () => {
    const grid = fixture.nativeElement.querySelector('[role="grid"]');
    expect(grid.getAttribute('aria-label')).toBe('Bingo card, 5 by 5');
  });

  it('should use gap-1 for size 5', () => {
    const grid = fixture.nativeElement.querySelector('[role="grid"]');
    expect(grid.classList.contains('gap-1')).toBe(true);
  });

  it('should emit squareMark when square emits mark', () => {
    fixture.componentRef.setInput('mode', 'game');
    fixture.detectChanges();
    const spy = vi.fn();
    fixture.componentInstance.squareMark.subscribe(spy);
    const squares = fixture.nativeElement.querySelectorAll('bng-square');
    const gridcell = squares[0].querySelector('[role="gridcell"]');
    gridcell?.click();
    expect(spy).toHaveBeenCalledWith({ row: 0, column: 0 });
  });
});
