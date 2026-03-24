import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { CreateRoomFormComponent } from './create-room-form.component';
import { RoomApiService } from '@core/api/room-api.service';
import { ENVIRONMENT } from '@core/environment/environment.token';
import { CreateRoomResponse } from '@core/api/models/responses';

describe('CreateRoomFormComponent', () => {
  let component: CreateRoomFormComponent;
  let fixture: ComponentFixture<CreateRoomFormComponent>;
  let roomApi: RoomApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomFormComponent);
    component = fixture.componentInstance;
    roomApi = TestBed.inject(RoomApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when name is empty on submit', async () => {
    await component.onSubmit();
    expect(component.nameError()).toBe('Name is required.');
  });

  it('should show error when name exceeds 50 chars', async () => {
    component.onNameChange('a'.repeat(51));
    await component.onSubmit();
    expect(component.nameError()).toBe('Name must be 50 characters or less.');
  });

  it('should clear name error on valid input after error', async () => {
    await component.onSubmit(); // trigger error
    expect(component.nameError()).toBeTruthy();

    component.onNameChange('Valid Name');
    expect(component.nameError()).toBeNull();
  });

  it('should call roomApi.createRoom on valid submit', async () => {
    const createSpy = vi.spyOn(roomApi, 'createRoom').mockResolvedValue({
      roomId: 'r1',
      joinCode: 'ABC123',
      playerId: 'p1',
      playerToken: 'tok',
    });

    component.onNameChange('Max');
    await component.onSubmit();

    expect(createSpy).toHaveBeenCalledWith({
      hostDisplayName: 'Max',
      season: 2026,
      grandPrixName: 'Bahrain Grand Prix',
      sessionType: 'Race',
    });
  });

  it('should emit success event on successful create', async () => {
    vi.spyOn(roomApi, 'createRoom').mockResolvedValue({
      roomId: 'r1',
      joinCode: 'ABC123',
      playerId: 'p1',
      playerToken: 'tok',
    });

    const successSpy = vi.fn();
    component.success.subscribe(successSpy);

    component.onNameChange('Max');
    await component.onSubmit();

    expect(successSpy).toHaveBeenCalledWith({ roomId: 'r1', playerId: 'p1', playerToken: 'tok' });
  });

  it('should set loading state during submit', async () => {
    let resolvePromise: (value: CreateRoomResponse) => void;
    vi.spyOn(roomApi, 'createRoom').mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    component.onNameChange('Max');
    const submitPromise = component.onSubmit();
    expect(component.loading()).toBe(true);

    resolvePromise!({
      roomId: 'r1',
      joinCode: 'ABC123',
      playerId: 'p1',
      playerToken: 'tok',
    });
    await submitPromise;
    expect(component.loading()).toBe(false);
  });

  it('should reset loading on API error', async () => {
    vi.spyOn(roomApi, 'createRoom').mockRejectedValue(new Error('fail'));

    component.onNameChange('Max');
    await component.onSubmit();

    expect(component.loading()).toBe(false);
  });
});
