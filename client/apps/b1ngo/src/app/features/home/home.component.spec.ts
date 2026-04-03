import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { RoomApiService } from '@core/api/room-api.service';
import { SessionService } from '@core/auth/session.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let roomApi: RoomApiService;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

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
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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
    sessionService.saveSession('r1', 'p1');
    vi.spyOn(roomApi, 'reconnect').mockResolvedValue({
      roomId: 'r1',
      playerId: 'p1',
      roomStatus: 'Lobby',
    });

    await component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
  });

  it('should keep session on failed reconnect', async () => {
    sessionService.saveSession('r1', 'p1');
    vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));

    await component.ngOnInit();

    expect(sessionService.hasSession()).toBe(true);
  });

  it('should navigate to room on create success', () => {
    component.onRoomCreated({ roomId: 'r2', playerId: 'p2' });

    expect(sessionService.hasSession()).toBe(true);
    expect(sessionService.getRoomId()).toBe('r2');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r2']);
  });

  it('should not show banner on create success', () => {
    component.onRoomCreated({ roomId: 'r2', playerId: 'p2' });

    expect(component.showBanner()).toBe(false);
  });

  it('should save gpName and sessionType on create success', () => {
    component.onRoomCreated({
      roomId: 'r2',
      playerId: 'p2',
      gpName: 'Monaco GP',
      sessionType: 'Race',
    });

    expect(sessionService.getGpName()).toBe('Monaco GP');
    expect(sessionService.getSessionType()).toBe('Race');
  });

  it('should navigate to room on join success', () => {
    component.onRoomJoined({ roomId: 'r3', playerId: 'p3' });

    expect(sessionService.hasSession()).toBe(true);
    expect(sessionService.getPlayerId()).toBe('p3');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r3']);
  });

  describe('rejoin banner', () => {
    it('should show banner after failed reconnect', async () => {
      sessionService.saveSession('r1', 'p1');
      vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));

      await component.ngOnInit();

      expect(component.showBanner()).toBe(true);
    });

    it('should show banner when arriving from room', async () => {
      sessionService.saveSession('r1', 'p1');
      Object.defineProperty(history, 'state', { value: { fromRoom: true }, writable: true });

      await component.ngOnInit();

      expect(component.showBanner()).toBe(true);
      Object.defineProperty(history, 'state', { value: null, writable: true });
    });

    it('should not show banner when no session exists', async () => {
      await component.ngOnInit();
      expect(component.showBanner()).toBe(false);
    });

    it('should not show banner before reconnect completes', () => {
      sessionService.saveSession('r1', 'p1');
      expect(component.showBanner()).toBe(false);
    });

    it('should hide banner on dismiss without clearing session', async () => {
      sessionService.saveSession('r1', 'p1');
      vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));
      await component.ngOnInit();

      component.onDismiss();

      expect(component.dismissed()).toBe(true);
      expect(component.showBanner()).toBe(false);
      expect(sessionService.hasSession()).toBe(true);
    });

    it('should navigate to room on rejoin', () => {
      sessionService.saveSession('r1', 'p1');

      component.onRejoin();

      expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
    });
  });
});
