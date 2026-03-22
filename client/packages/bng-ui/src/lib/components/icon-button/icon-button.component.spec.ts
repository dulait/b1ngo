import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngIconButtonComponent } from './icon-button.component';

describe('BngIconButtonComponent', () => {
  let fixture: ComponentFixture<BngIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngIconButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngIconButtonComponent);
    fixture.componentRef.setInput('icon', '<circle cx="12" cy="12" r="1"/>');
    fixture.componentRef.setInput('ariaLabel', 'Test button');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render icon inside button', () => {
    const icon = fixture.nativeElement.querySelector('bng-icon');
    expect(icon).toBeTruthy();
  });

  it('should apply aria-label', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Test button');
  });

  it('should use default size (w-9 h-9)', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('w-9')).toBe(true);
    expect(button.classList.contains('h-9')).toBe(true);
  });

  it('should use sm size (w-8 h-8)', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('w-8')).toBe(true);
    expect(button.classList.contains('h-8')).toBe(true);
  });
});
