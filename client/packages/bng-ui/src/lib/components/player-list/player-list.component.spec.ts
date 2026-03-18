import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngPlayerListComponent } from './player-list.component';

describe('BngPlayerListComponent', () => {
  let fixture: ComponentFixture<BngPlayerListComponent>;

  const players = [
    { playerId: 'p1', displayName: 'Lewis Hamilton' },
    { playerId: 'p2', displayName: 'Max Verstappen' },
    { playerId: 'p3', displayName: 'Lando Norris' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngPlayerListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngPlayerListComponent);
    fixture.componentRef.setInput('players', players);
    fixture.componentRef.setInput('hostPlayerId', 'p2');
    fixture.componentRef.setInput('currentPlayerId', 'p1');
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
