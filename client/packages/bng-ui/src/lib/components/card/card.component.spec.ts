import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngCardComponent } from './card.component';

describe('BngCardComponent', () => {
  let fixture: ComponentFixture<BngCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply card styling', () => {
    const div = fixture.nativeElement.querySelector('div');
    expect(div.className).toContain('bg-bg-surface');
    expect(div.className).toContain('rounded-xl');
    expect(div.className).toContain('p-4');
  });

  it('should render header when provided', () => {
    fixture.componentRef.setInput('header', 'Test Header');
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.text-\\[1\\.125rem\\]');
    expect(header).toBeTruthy();
    expect(header.textContent.trim()).toBe('Test Header');
  });

  it('should not render header when null', () => {
    const headers = fixture.nativeElement.querySelectorAll('.text-\\[1\\.125rem\\]');
    expect(headers.length).toBe(0);
  });

  it('should set role region with header', () => {
    fixture.componentRef.setInput('header', 'Section');
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('[role="region"]');
    expect(div).toBeTruthy();
    expect(div.getAttribute('aria-label')).toBe('Section');
  });
});
