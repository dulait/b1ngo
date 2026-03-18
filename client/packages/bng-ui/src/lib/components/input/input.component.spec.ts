import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngInputComponent } from './input.component';

describe('BngInputComponent', () => {
  let component: BngInputComponent;
  let fixture: ComponentFixture<BngInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent.trim()).toBe('Test Label');
  });

  it('should render text input by default', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  it('should render select when type is select', () => {
    fixture.componentRef.setInput('type', 'select');
    fixture.componentRef.setInput('options', [{ value: 'a', label: 'A' }]);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('should show error message', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('p');
    expect(error.textContent.trim()).toBe('Required field');
    expect(error.className).toContain('text-error');
  });

  it('should show hint message', () => {
    fixture.componentRef.setInput('hint', 'Enter your name');
    fixture.detectChanges();
    const hint = fixture.nativeElement.querySelector('p');
    expect(hint.textContent.trim()).toBe('Enter your name');
  });

  it('should set aria-invalid when error present', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should emit valueChange on input', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('should apply error border class', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('border-error')).toBe(true);
  });
});
