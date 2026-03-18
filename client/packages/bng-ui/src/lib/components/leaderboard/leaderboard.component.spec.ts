import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngLeaderboardComponent } from './leaderboard.component';

describe('BngLeaderboardComponent', () => {
  let fixture: ComponentFixture<BngLeaderboardComponent>;

  const players = [
    { playerId: 'p1', displayName: 'Lewis Hamilton' },
    { playerId: 'p2', displayName: 'Max Verstappen' },
  ];

  const entries = [
    { rank: 1, playerId: 'p1', pattern: 'Row', completedAt: new Date().toISOString() },
    { rank: 2, playerId: 'p2', pattern: 'Column', completedAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngLeaderboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngLeaderboardComponent);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('players', players);
    fixture.componentRef.setInput('currentPlayerId', 'p1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have role list', () => {
    const list = fixture.nativeElement.querySelector('[role="list"]');
    expect(list).toBeTruthy();
  });

  it('should render entries', () => {
    const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(2);
  });

  it('should show rank #1 in green', () => {
    const greenRank = fixture.nativeElement.querySelector('.text-green-500');
    expect(greenRank).toBeTruthy();
    expect(greenRank.textContent).toContain('#1');
  });

  it('should show empty state when no entries', () => {
    fixture.componentRef.setInput('entries', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No winners yet.');
  });

  it('should show pattern badge', () => {
    expect(fixture.nativeElement.textContent).toContain('Row');
    expect(fixture.nativeElement.textContent).toContain('Column');
  });

  it('should highlight current player in full variant', () => {
    fixture.componentRef.setInput('variant', 'full');
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelector('.bg-accent-muted');
    expect(highlighted).toBeTruthy();
  });

  it('should show (You) for current player', () => {
    expect(fixture.nativeElement.textContent).toContain('(You)');
  });
});
