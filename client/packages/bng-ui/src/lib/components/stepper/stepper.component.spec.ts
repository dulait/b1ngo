import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngStepperComponent } from './stepper.component';

describe('BngStepperComponent', () => {
  let fixture: ComponentFixture<BngStepperComponent>;
  let component: BngStepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngStepperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalSteps', 4);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render step indicator dots', () => {
    const dots = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(dots.length).toBe(4);
  });

  it('should mark first dot as selected by default', () => {
    const dots = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(dots[0].getAttribute('aria-selected')).toBe('true');
    expect(dots[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should hide Back button on first step', () => {
    const buttons = fixture.nativeElement.querySelectorAll('bng-button') as NodeListOf<HTMLElement>;
    const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
    expect(labels).not.toContain('Previous step');
  });

  it('should show Next button on non-last step', () => {
    const buttons = fixture.nativeElement.querySelectorAll('bng-button') as NodeListOf<HTMLElement>;
    const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
    expect(labels).toContain('Next step');
  });

  it('should show Done button on last step', () => {
    fixture.componentRef.setInput('currentStep', 3);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('bng-button') as NodeListOf<HTMLElement>;
    const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
    expect(labels).toContain('Done');
    expect(labels).not.toContain('Next step');
  });

  it('should show Back button on non-first step', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('bng-button') as NodeListOf<HTMLElement>;
    const labels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
    expect(labels).toContain('Previous step');
  });

  it('should emit stepChange on Next click', () => {
    const spy = vi.fn();
    component.stepChange.subscribe(spy);

    const nextBtn = fixture.nativeElement.querySelector('[aria-label="Next step"]');
    nextBtn?.querySelector('button')?.click();

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should emit completed on Done click', () => {
    fixture.componentRef.setInput('currentStep', 3);
    fixture.detectChanges();
    const spy = vi.fn();
    component.completed.subscribe(spy);

    const doneBtn = fixture.nativeElement.querySelector('[aria-label="Done"]');
    doneBtn?.querySelector('button')?.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should show Skip button by default', () => {
    const skip = fixture.nativeElement.querySelector('[aria-label="Skip"]');
    expect(skip).toBeTruthy();
  });

  it('should hide Skip button when showSkip is false', () => {
    fixture.componentRef.setInput('showSkip', false);
    fixture.detectChanges();
    const skip = fixture.nativeElement.querySelector('[aria-label="Skip"]');
    expect(skip).toBeFalsy();
  });

  it('should hide Skip button on last step', () => {
    fixture.componentRef.setInput('currentStep', 3);
    fixture.detectChanges();
    const skip = fixture.nativeElement.querySelector('[aria-label="Skip"]');
    expect(skip).toBeFalsy();
  });

  it('should emit skipped on Skip click', () => {
    const spy = vi.fn();
    component.skipped.subscribe(spy);

    const skip = fixture.nativeElement.querySelector('[aria-label="Skip"]');
    skip?.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label on dots', () => {
    const dots = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(dots[0].getAttribute('aria-label')).toBe('Step 1 of 4');
    expect(dots[2].getAttribute('aria-label')).toBe('Step 3 of 4');
  });

  it('should have tablist role on dot container', () => {
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
  });
});
