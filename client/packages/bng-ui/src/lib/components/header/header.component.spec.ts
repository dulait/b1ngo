import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BngHeaderComponent } from './header.component';

describe('BngHeaderComponent', () => {
  let fixture: ComponentFixture<BngHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngHeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have role banner', () => {
    const header = fixture.nativeElement.querySelector('[role="banner"]');
    expect(header).toBeTruthy();
  });

  it('should show B1NGO wordmark', () => {
    expect(fixture.nativeElement.textContent).toContain('B1NGO');
  });

  it('should show session info', () => {
    fixture.componentRef.setInput('session', { grandPrixShort: 'MON', sessionType: 'Race' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('MON / Race');
  });

  it('should show status badge', () => {
    fixture.componentRef.setInput('roomStatus', 'Active');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('bng-status-badge');
    expect(badge).toBeTruthy();
  });

  it('should not show status badge when null', () => {
    const badge = fixture.nativeElement.querySelector('bng-status-badge');
    expect(badge).toBeFalsy();
  });
});
