import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngButtonComponent } from './button.component';

describe('BngButtonComponent', () => {
  let component: BngButtonComponent;
  let fixture: ComponentFixture<BngButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render as button element', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn.type).toBe('button');
  });

  it('should apply primary variant classes by default', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('bg-accent');
    expect(btn.className).toContain('text-white');
  });

  it('should apply secondary variant classes', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('border-border-default');
  });

  it('should apply ghost variant classes', () => {
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('text-accent');
  });

  it('should apply danger variant classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('bg-[var(--bng-button-bg-danger)]');
    expect(btn.className).toContain('text-white');
  });

  it('should apply size lg height', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('h-[var(--bng-button-height-lg)]');
  });

  it('should apply size default height', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('h-[var(--bng-button-height-default)]');
  });

  it('should apply size sm height', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('h-[var(--bng-button-height-sm)]');
  });

  it('should set aria-disabled when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('should set aria-busy when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });

  it('should show spinner when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('bng-icon');
    expect(icon).toBeTruthy();
  });

  it('should apply w-full when fullWidth', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.className).toContain('w-full');
  });

  it('should emit clicked on click', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.clicked.subscribe(spy);
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(spy).not.toHaveBeenCalled();
  });
});
