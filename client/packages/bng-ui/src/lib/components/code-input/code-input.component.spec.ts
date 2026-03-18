import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngCodeInputComponent } from './code-input.component';

describe('BngCodeInputComponent', () => {
  let component: BngCodeInputComponent;
  let fixture: ComponentFixture<BngCodeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngCodeInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngCodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 6 input boxes by default', () => {
    const boxes = fixture.nativeElement.querySelectorAll('.w-12');
    expect(boxes.length).toBe(6);
  });

  it('should render display mode', () => {
    fixture.componentRef.setInput('mode', 'display');
    fixture.componentRef.setInput('value', 'ABC123');
    fixture.detectChanges();
    const chars = fixture.nativeElement.querySelectorAll('.bg-bg-surface-elevated');
    expect(chars.length).toBeGreaterThan(0);
  });

  it('should show error message', () => {
    fixture.componentRef.setInput('error', 'Invalid code');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.text-error');
    expect(error).toBeTruthy();
    expect(error.textContent.trim()).toBe('Invalid code');
  });

  it('should render copy button in display mode', () => {
    fixture.componentRef.setInput('mode', 'display');
    fixture.componentRef.setInput('value', 'ABCDEF');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const copyBtn = Array.from(buttons).find((b) =>
      (b as HTMLElement).textContent?.includes('Copy'),
    );
    expect(copyBtn).toBeTruthy();
  });

  it('should have hidden input for accessibility', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('aria-label')).toBe('Join code');
  });
});
