import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngPlayerListComponent } from './player-list.component';
import { PlayerChipItem } from '../../types';

describe('BngPlayerListComponent', () => {
  let fixture: ComponentFixture<BngPlayerListComponent>;

  const players: PlayerChipItem[] = [
    { id: 'p1', displayName: 'Lewis Hamilton', isHost: false, isCurrentUser: true },
    { id: 'p2', displayName: 'Max Verstappen', isHost: true, isCurrentUser: false },
    { id: 'p3', displayName: 'Lando Norris', isHost: false, isCurrentUser: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngPlayerListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngPlayerListComponent);
    fixture.componentRef.setInput('players', players);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render all players', () => {
    const chips = fixture.nativeElement.querySelectorAll('bng-player-chip');
    expect(chips.length).toBe(3);
  });

  it('should have role list', () => {
    const list = fixture.nativeElement.querySelector('[role="list"]');
    expect(list).toBeTruthy();
  });

  it('should render host first', () => {
    const chips = fixture.nativeElement.querySelectorAll('bng-player-chip');
    expect(chips[0].textContent).toContain('Max Verstappen');
  });

  it('should have space-y-2 gap', () => {
    const list = fixture.nativeElement.querySelector('[role="list"]');
    expect(list.className).toContain('space-y-2');
  });
});
