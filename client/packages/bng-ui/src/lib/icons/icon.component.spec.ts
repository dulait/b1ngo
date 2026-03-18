import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngIconComponent } from './icon.component';
import { bngIconCopy, bngIconShare, bngIconX } from './icons';

describe('BngIconComponent', () => {
  let fixture: ComponentFixture<BngIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngIconComponent);
    fixture.componentRef.setInput('icon', bngIconCopy);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render svg element', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should set default size to md (16px)', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  it('should accept different sizes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('20');
  });

  it('should render different icons', () => {
    fixture.componentRef.setInput('icon', bngIconX);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.innerHTML).toContain('M18 6L6 18');
  });

  it('should set stroke attributes', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
  });

  it('should accept custom viewBox', () => {
    fixture.componentRef.setInput('viewBox', '0 0 12 12');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 12 12');
  });
});

describe('Icon constants', () => {
  it('should export all icons as strings', () => {
    expect(typeof bngIconCopy).toBe('string');
    expect(typeof bngIconShare).toBe('string');
    expect(typeof bngIconX).toBe('string');
  });
});
