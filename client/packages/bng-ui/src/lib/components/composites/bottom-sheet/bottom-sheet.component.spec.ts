import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngBottomSheetComponent } from './bottom-sheet.component';

describe('BngBottomSheetComponent', () => {
  let fixture: ComponentFixture<BngBottomSheetComponent>;
  let component: BngBottomSheetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngBottomSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Sheet');
    fixture.detectChanges();
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

  it('should show title', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Sheet');
  });

  it('should have aria-modal', () => {
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

  it('should show drag handle on mobile', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const handle = fixture.nativeElement.querySelector('.w-10.h-1');
    expect(handle).toBeTruthy();
  });
});
