import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngPlayerChipComponent } from './player-chip.component';

describe('BngPlayerChipComponent', () => {
  let fixture: ComponentFixture<BngPlayerChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngPlayerChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngPlayerChipComponent);
    fixture.componentRef.setInput('displayName', 'Max Verstappen');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render player name', () => {
    expect(fixture.nativeElement.textContent).toContain('Max Verstappen');
  });

  it('should render avatar initials', () => {
    expect(fixture.nativeElement.textContent).toContain('MA');
  });

  it('should show host badge', () => {
    fixture.componentRef.setInput('isHost', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Host');
  });

  it('should show (You) for current player', () => {
    fixture.componentRef.setInput('isCurrentPlayer', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('(You)');
  });

  it('should highlight current player with accent background', () => {
    fixture.componentRef.setInput('isCurrentPlayer', true);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.bg-accent-muted');
    expect(row).toBeTruthy();
  });

  it('should have correct aria-label', () => {
    fixture.componentRef.setInput('isHost', true);
    fixture.componentRef.setInput('isCurrentPlayer', true);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[aria-label]');
    expect(el.getAttribute('aria-label')).toContain('Max Verstappen');
    expect(el.getAttribute('aria-label')).toContain('host');
    expect(el.getAttribute('aria-label')).toContain('you');
  });
});
