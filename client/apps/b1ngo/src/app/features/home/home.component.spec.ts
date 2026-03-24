import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { RoomApiService } from '@core/api/room-api.service';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let roomApi: RoomApiService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not attempt reconnect when no session exists', async () => {
    const reconnectSpy = vi.spyOn(roomApi, 'reconnect');
    await component.ngOnInit();
    expect(reconnectSpy).not.toHaveBeenCalled();
  });

  it('should attempt reconnect when session exists', async () => {
    authService.saveSession('r1', 'p1', 'tok');
    vi.spyOn(roomApi, 'reconnect').mockResolvedValue({
      roomId: 'r1',
      playerId: 'p1',
      roomStatus: 'Lobby',
    });

    await component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
  });

  it('should clear session on failed reconnect', async () => {
    authService.saveSession('r1', 'p1', 'tok');
    vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));
    const clearSpy = vi.spyOn(authService, 'clearSession');

    await component.ngOnInit();

    expect(clearSpy).toHaveBeenCalled();
  });

  it('should navigate to room on create success', () => {
    component.onRoomCreated({ roomId: 'r2', playerId: 'p2', playerToken: 'tok' });

    expect(authService.hasSession()).toBe(true);
    expect(authService.getRoomId()).toBe('r2');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r2']);
  });

  it('should navigate to room on join success', () => {
    component.onRoomJoined({ roomId: 'r3', playerId: 'p3', playerToken: 'tok' });

    expect(authService.hasSession()).toBe(true);
    expect(authService.getPlayerId()).toBe('p3');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r3']);
  });
});
