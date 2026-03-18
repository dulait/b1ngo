import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngSquareComponent } from './square.component';

describe('BngSquareComponent', () => {
  let component: BngSquareComponent;
  let fixture: ComponentFixture<BngSquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngSquareComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngSquareComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('displayText', 'Test Item');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render display text', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Item');
  });

  it('should have role gridcell', () => {
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div).toBeTruthy();
  });

  it('should apply unmarked styling by default', () => {
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.className).toContain('bg-bg-surface');
    expect(div.className).toContain('border-border-default');
  });

  it('should apply marked styling with "You" label when marked by Player', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Player');
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.className).toContain('bg-accent-muted');
    expect(div.className).toContain('border-accent');
    expect(fixture.nativeElement.textContent).toContain('You');
  });

  it('should show "Host" label when marked by Host', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Host');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Host');
  });

  it('should show "Auto" label when marked by Api', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Api');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Auto');
  });

  it('should apply free space styling', () => {
    fixture.componentRef.setInput('isFreeSpace', true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.className).toContain('opacity-40');
    expect(div.className).toContain('bg-bg-surface-elevated');
  });

  it('should apply winning border', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Player');
    fixture.componentRef.setInput('isWinning', true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.className).toContain('border-success');
    expect(div.className).toContain('border-2');
  });

  it('should apply editable dashed border', () => {
    fixture.componentRef.setInput('isEditable', true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.className).toContain('border-dashed');
  });

  it('should emit mark on tap when markable and unmarked', () => {
    fixture.componentRef.setInput('isMarkable', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.mark.subscribe(spy);
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    div.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit unmark on tap when marked', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Player');
    fixture.detectChanges();
    const spy = vi.fn();
    component.unmark.subscribe(spy);
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    div.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on free space click', () => {
    fixture.componentRef.setInput('isFreeSpace', true);
    fixture.componentRef.setInput('isMarkable', true);
    fixture.detectChanges();
    const markSpy = vi.fn();
    const unmarkSpy = vi.fn();
    component.mark.subscribe(markSpy);
    component.unmark.subscribe(unmarkSpy);
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    div.click();
    expect(markSpy).not.toHaveBeenCalled();
    expect(unmarkSpy).not.toHaveBeenCalled();
  });

  it('should set aria-selected when marked', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedBy', 'Player');
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="gridcell"]');
    expect(div.getAttribute('aria-selected')).toBe('true');
  });

  it('should use text-[9px] for matrix size >= 7', () => {
    fixture.componentRef.setInput('matrixSize', 7);
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('.square-text-clamp');
    expect(text.className).toContain('text-[9px]');
  });

  it('should use text-[11px] for matrix size 5', () => {
    const text = fixture.nativeElement.querySelector('.square-text-clamp');
    expect(text.className).toContain('text-[11px]');
  });
});
