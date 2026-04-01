import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { RoomApiService } from '@core/api/room-api.service';
import { AuthService } from '@core/auth/auth.service';
import { SessionService } from '@core/auth/session.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let roomApi: RoomApiService;
  let sessionService: SessionService;
  let authService: AuthService;
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
    authService = TestBed.inject(AuthService);
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
    sessionService.saveSession('r1', 'p1', 'tok');
    vi.spyOn(roomApi, 'reconnect').mockResolvedValue({
      roomId: 'r1',
      playerId: 'p1',
      roomStatus: 'Lobby',
    });

    await component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
  });

  it('should keep session on failed reconnect', async () => {
    sessionService.saveSession('r1', 'p1', 'tok');
    vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));

    await component.ngOnInit();

    expect(sessionService.hasSession()).toBe(true);
  });

  it('should navigate to room on create success', () => {
    component.onRoomCreated({ roomId: 'r2', playerId: 'p2', playerToken: 'tok' });

    expect(sessionService.hasSession()).toBe(true);
    expect(sessionService.getRoomId()).toBe('r2');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r2']);
  });

  it('should save gpName and sessionType on create success', () => {
    component.onRoomCreated({
      roomId: 'r2',
      playerId: 'p2',
      playerToken: 'tok',
      gpName: 'Monaco GP',
      sessionType: 'Race',
    });

    expect(sessionService.getGpName()).toBe('Monaco GP');
    expect(sessionService.getSessionType()).toBe('Race');
  });

  it('should navigate to room on join success', () => {
    component.onRoomJoined({ roomId: 'r3', playerId: 'p3', playerToken: 'tok' });

    expect(sessionService.hasSession()).toBe(true);
    expect(sessionService.getPlayerId()).toBe('p3');
    expect(router.navigate).toHaveBeenCalledWith(['/room', 'r3']);
  });

  describe('rejoin banner', () => {
    it('should show banner when anon user has session after failed reconnect', async () => {
      sessionService.saveSession('r1', 'p1', 'tok');
      vi.spyOn(roomApi, 'reconnect').mockRejectedValue(new Error('expired'));

      await component.ngOnInit();

      expect(component.showBanner()).toBe(true);
    });

    it('should not show banner when no session exists', () => {
      expect(component.showBanner()).toBe(false);
    });

    it('should not show banner when user is authenticated', () => {
      sessionService.saveSession('r1', 'p1', 'tok');
      authService.currentUser.set({ userId: 'u1', displayName: 'Test', email: 'a@b.com', roles: [] });

      expect(component.showBanner()).toBe(false);
    });

    it('should hide banner on dismiss without clearing session', () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      component.onDismiss();

      expect(component.dismissed()).toBe(true);
      expect(component.showBanner()).toBe(false);
      expect(sessionService.hasSession()).toBe(true);
    });

    it('should persist dismiss in sessionStorage', () => {
      component.onDismiss();
      expect(sessionStorage.getItem('bng-rejoin-dismissed')).toBe('true');
    });

    it('should navigate to room on rejoin', () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      component.onRejoin();

      expect(router.navigate).toHaveBeenCalledWith(['/room', 'r1']);
    });

    it('should show session context when gpName and sessionType are set', () => {
      sessionService.saveSession('r1', 'p1', 'tok', 'Monaco GP', 'Race');

      expect(component.sessionContext()).toBe('Monaco GP / Race');
    });

    it('should return empty context when gpName/sessionType are missing', () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      expect(component.sessionContext()).toBe('');
    });
  });

  describe('session replacement confirmation', () => {
    it('should resolve guard immediately when no session exists', async () => {
      const result = await component.beforeCreateGuard();
      expect(result).toBe(true);
      expect(component.confirmOpen()).toBe(false);
    });

    it('should resolve guard immediately when user is authenticated', async () => {
      sessionService.saveSession('r1', 'p1', 'tok');
      authService.currentUser.set({ userId: 'u1', displayName: 'Test', email: 'a@b.com', roles: [] });

      const result = await component.beforeCreateGuard();
      expect(result).toBe(true);
    });

    it('should open modal when anon user has session', () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      component.beforeCreateGuard();

      expect(component.confirmOpen()).toBe(true);
      expect(component.confirmAction()).toBe('Creating a new room');
    });

    it('should set correct action for join guard', () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      component.beforeJoinGuard();

      expect(component.confirmAction()).toBe('Joining a different room');
    });

    it('should resolve true when user confirms', async () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      const promise = component.beforeCreateGuard();
      component.confirmReplace();

      expect(await promise).toBe(true);
      expect(component.confirmOpen()).toBe(false);
    });

    it('should resolve false when user cancels', async () => {
      sessionService.saveSession('r1', 'p1', 'tok');

      const promise = component.beforeCreateGuard();
      component.cancelReplace();

      expect(await promise).toBe(false);
      expect(component.confirmOpen()).toBe(false);
    });
  });
});
