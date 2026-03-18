import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngPillToggleComponent } from './pill-toggle.component';

describe('BngPillToggleComponent', () => {
  let fixture: ComponentFixture<BngPillToggleComponent>;
  let component: BngPillToggleComponent;

  const options = [
    { value: 'row', label: 'Row', selected: true },
    { value: 'column', label: 'Column', selected: false },
    { value: 'diagonal', label: 'Diagonal', selected: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngPillToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngPillToggleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all options', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should show selected state with filled checkbox', () => {
    const svgs = fixture.nativeElement.querySelectorAll('svg');
    expect(svgs.length).toBe(2); // Row and Diagonal are selected
  });

  it('should show unselected state with empty checkbox', () => {
    const empties = fixture.nativeElement.querySelectorAll('span.w-3\\.5');
    expect(empties.length).toBe(1); // Column is unselected
  });

  it('should apply accent classes to selected pills', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].classList.contains('border-accent')).toBe(true);
    expect(buttons[0].classList.contains('text-accent')).toBe(true);
    expect(buttons[1].classList.contains('border-border-default')).toBe(true);
  });

  it('should set aria-pressed', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('should emit toggled on click', () => {
    const spy = vi.fn();
    component.toggled.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith('column');
  });

  it('should have role group', () => {
    const group = fixture.nativeElement.querySelector('[role="group"]');
    expect(group).toBeTruthy();
  });
});
