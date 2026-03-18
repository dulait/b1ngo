import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngSkeletonComponent } from './skeleton.component';

describe('BngSkeletonComponent', () => {
  let fixture: ComponentFixture<BngSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngSkeletonComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render rect variant by default', () => {
    const el = fixture.nativeElement.querySelector('.skeleton-pulse');
    expect(el).toBeTruthy();
    expect(el.classList.contains('rounded-lg')).toBe(true);
  });

  it('should render text variant with multiple lines', () => {
    fixture.componentRef.setInput('variant', 'text');
    fixture.componentRef.setInput('lines', 3);
    fixture.detectChanges();
    const lines = fixture.nativeElement.querySelectorAll('.skeleton-pulse');
    expect(lines.length).toBe(3);
  });

  it('should render circle variant', () => {
    fixture.componentRef.setInput('variant', 'circle');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.rounded-full');
    expect(el).toBeTruthy();
  });

  it('should render matrix variant with 25 cells', () => {
    fixture.componentRef.setInput('variant', 'matrix');
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll('.skeleton-pulse');
    expect(cells.length).toBe(25);
  });

  it('should render player-list variant with 3 rows', () => {
    fixture.componentRef.setInput('variant', 'player-list');
    fixture.detectChanges();
    const avatars = fixture.nativeElement.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(3);
  });

  it('should be aria-hidden', () => {
    const el = fixture.nativeElement.querySelector('[aria-hidden="true"]');
    expect(el).toBeTruthy();
  });
});
