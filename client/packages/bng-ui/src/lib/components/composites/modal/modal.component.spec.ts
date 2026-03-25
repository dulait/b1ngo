import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi, afterEach } from 'vitest';
import { BngModalComponent } from './modal.component';

describe('BngModalComponent', () => {
  let fixture: ComponentFixture<BngModalComponent>;
  let component: BngModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render content when closed', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeFalsy();
  });

  it('should render content when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it('should have aria-modal attribute', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('should emit closed on backdrop click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.closed.subscribe(spy);
    const backdrop = fixture.nativeElement.querySelector('.bg-black\\/50');
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should apply medium max-width by default', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.classList.contains('max-w-[448px]')).toBe(true);
  });

  it('should apply small max-width', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('maxWidth', 'sm');
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.classList.contains('max-w-[384px]')).toBe(true);
  });

  it('should apply large max-width', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('maxWidth', 'lg');
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.classList.contains('max-w-[512px]')).toBe(true);
  });

  it('should lock body scroll when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when closed', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('');
  });
});
