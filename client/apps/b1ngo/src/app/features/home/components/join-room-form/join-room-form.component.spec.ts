import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { JoinRoomFormComponent } from './join-room-form.component';
import { RoomApiService } from '@core/api/room-api.service';
import { ENVIRONMENT } from '@core/environment/environment.token';
import { JoinRoomResponse } from '@core/api/models/responses';

describe('JoinRoomFormComponent', () => {
  let component: JoinRoomFormComponent;
  let fixture: ComponentFixture<JoinRoomFormComponent>;
  let roomApi: RoomApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinRoomFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinRoomFormComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when code is incomplete on submit', async () => {
    component.onCodeChange('ABC');
    component.onNameChange('Max');
    await component.onSubmit();
    expect(component.codeError()).toBe('Enter a 6-character join code.');
  });

  it('should show error when name is empty on submit', async () => {
    component.onCodeComplete('ABCDEF');
    await component.onSubmit();
    expect(component.nameError()).toBe('Name is required.');
  });

  it('should clear code error when code changes after error', async () => {
    await component.onSubmit();
    expect(component.codeError()).toBeTruthy();

    component.onCodeChange('A');
    expect(component.codeError()).toBeNull();
  });

  it('should call roomApi.joinRoom on valid submit', async () => {
    const joinSpy = vi.spyOn(roomApi, 'joinRoom').mockResolvedValue({
      roomId: 'r1',
      playerId: 'p2',
      playerToken: 'tok',
      displayName: 'Max',
    });

    component.onCodeComplete('H7KM3V');
    component.onNameChange('Max');
    await component.onSubmit();

    expect(joinSpy).toHaveBeenCalledWith({
      joinCode: 'H7KM3V',
      displayName: 'Max',
    });
  });

  it('should emit success event on successful join', async () => {
    vi.spyOn(roomApi, 'joinRoom').mockResolvedValue({
      roomId: 'r1',
      playerId: 'p2',
      playerToken: 'tok',
      displayName: 'Max',
    });

    const successSpy = vi.fn();
    component.success.subscribe(successSpy);

    component.onCodeComplete('H7KM3V');
    component.onNameChange('Max');
    await component.onSubmit();

    expect(successSpy).toHaveBeenCalledWith({ roomId: 'r1', playerId: 'p2', playerToken: 'tok' });
  });

  it('should set and reset loading state', async () => {
    let resolvePromise: (value: JoinRoomResponse) => void;
    vi.spyOn(roomApi, 'joinRoom').mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    component.onCodeComplete('H7KM3V');
    component.onNameChange('Max');
    const submitPromise = component.onSubmit();
    expect(component.loading()).toBe(true);

    resolvePromise!({
      roomId: 'r1',
      playerId: 'p2',
      playerToken: 'tok',
      displayName: 'Max',
    });
    await submitPromise;
    expect(component.loading()).toBe(false);
  });

  it('should reset loading on API error', async () => {
    vi.spyOn(roomApi, 'joinRoom').mockRejectedValue(new Error('fail'));

    component.onCodeComplete('H7KM3V');
    component.onNameChange('Max');
    await component.onSubmit();

    expect(component.loading()).toBe(false);
  });
});
