import { TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { SignalRService } from './signalr.service';
import { ENVIRONMENT } from '../environment';

describe('SignalRService', () => {
  let service: SignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignalRService,
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: 'https://test.example.com' } },
      ],
    });
    service = TestBed.inject(SignalRService);
  });

  it('should initialize with disconnected state', () => {
    expect(service.connectionState()).toBe('disconnected');
  });

  it('should initialize event signals as null', () => {
    expect(service.playerJoined()).toBeNull();
    expect(service.gameStarted()).toBeNull();
    expect(service.squareMarked()).toBeNull();
    expect(service.squareUnmarked()).toBeNull();
    expect(service.bingoAchieved()).toBeNull();
    expect(service.gameCompleted()).toBeNull();
  });

  it('should be a no-op when disconnecting without a connection', async () => {
    await service.disconnect();
    expect(service.connectionState()).toBe('disconnected');
  });
});
