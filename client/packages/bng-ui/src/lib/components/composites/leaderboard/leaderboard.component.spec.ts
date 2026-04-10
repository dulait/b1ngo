import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngLeaderboardComponent } from './leaderboard.component';
import { LeaderboardItem } from '../../../types';

describe('BngLeaderboardComponent', () => {
  let fixture: ComponentFixture<BngLeaderboardComponent>;

  const entries: LeaderboardItem[] = [
    { rank: 1, displayName: 'Lewis Hamilton', badge: 'Row', timestamp: new Date().toISOString(), isCurrentUser: true },
    { rank: 2, displayName: 'Max Verstappen', badge: 'Column', timestamp: new Date().toISOString(), isCurrentUser: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngLeaderboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngLeaderboardComponent);
    fixture.componentRef.setInput('entries', entries);
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
    const greenRank = fixture.nativeElement.querySelector('.text-success');
    expect(greenRank).toBeTruthy();
    expect(greenRank.textContent).toContain('#1');
  });

  it('should show default empty state when no entries', () => {
    fixture.componentRef.setInput('entries', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No winners yet.');
  });

  it('should show custom empty text when provided', () => {
    fixture.componentRef.setInput('entries', []);
    fixture.componentRef.setInput('emptyText', 'No winners.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No winners.');
  });

  it('should show badge', () => {
    expect(fixture.nativeElement.textContent).toContain('Row');
    expect(fixture.nativeElement.textContent).toContain('Column');
  });

  it('should highlight current user in full variant', () => {
    fixture.componentRef.setInput('variant', 'full');
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelector('.bg-accent-muted');
    expect(highlighted).toBeTruthy();
  });

  it('should render timing instead of wall-clock time in full variant', () => {
    const timedEntries: LeaderboardItem[] = [
      { rank: 1, displayName: 'Lewis Hamilton', badge: 'Row', timestamp: new Date().toISOString(), timing: '32:05', isCurrentUser: false },
      { rank: 2, displayName: 'Max Verstappen', badge: 'Column', timestamp: new Date().toISOString(), timing: '+4:12', isCurrentUser: false },
    ];
    fixture.componentRef.setInput('entries', timedEntries);
    fixture.componentRef.setInput('variant', 'full');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('32:05');
    expect(text).toContain('+4:12');
  });

  it('should show (You) for current user', () => {
    expect(fixture.nativeElement.textContent).toContain('(You)');
  });
});
