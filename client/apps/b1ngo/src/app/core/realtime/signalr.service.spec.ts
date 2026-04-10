import { TestBed } from '@angular/core/testing';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { SignalRService } from './signalr.service';
import { ENVIRONMENT } from '../environment/environment.token';

type Handler = (...args: unknown[]) => void;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMockConnection() {
  const handlers = new Map<string, Handler[]>();

  return {
    handlers,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    on: vi.fn((event: string, handler: Handler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    }),
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
    emit(event: string, ...args: unknown[]): void {
      for (const handler of handlers.get(event) ?? []) {
        handler(...args);
      }
    },
  };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('SignalRService', () => {
  let service: SignalRService;
  let mockConnection: ReturnType<typeof createMockConnection>;

  beforeEach(() => {
    mockConnection = createMockConnection();

    vi.spyOn(HubConnectionBuilder.prototype, 'withUrl').mockReturnThis();
    vi.spyOn(HubConnectionBuilder.prototype, 'withAutomaticReconnect').mockReturnThis();
    vi.spyOn(HubConnectionBuilder.prototype, 'build').mockReturnValue(mockConnection as never);

    TestBed.configureTestingModule({
      providers: [
        SignalRService,
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com' },
        },
      ],
    });
    service = TestBed.inject(SignalRService);
  });

  afterEach(async () => {
    await service.disconnect();
    vi.restoreAllMocks();
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

  describe('connect()', () => {
    it('should not set connected until Connected event is received', async () => {
      const connectPromise = service.connect('room-1');
      await flushMicrotasks();

      expect(service.connectionState()).toBe('connecting');

      mockConnection.emit('Connected');
      await connectPromise;

      expect(service.connectionState()).toBe('connected');
    });

    it('should remain connecting between start() and Connected event', async () => {
      const states: string[] = [];

      mockConnection.start.mockImplementation(async () => {
        states.push(service.connectionState());
      });

      const connectPromise = service.connect('room-1');
      await flushMicrotasks();
      states.push(service.connectionState());

      mockConnection.emit('Connected');
      await connectPromise;
      states.push(service.connectionState());

      expect(states).toEqual(['connecting', 'connecting', 'connected']);
    });

    it('should reject if Connected event is not received within timeout', async () => {
      vi.useFakeTimers();

      const connectPromise = service.connect('room-1');
      connectPromise.catch(() => {});

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(5000);

      await expect(connectPromise).rejects.toThrow('SignalR group join timed out');

      vi.useRealTimers();
    });

    it('should register event handlers before start()', async () => {
      mockConnection.start.mockImplementation(async () => {
        expect(mockConnection.on).toHaveBeenCalledWith('PlayerJoined', expect.any(Function));
        expect(mockConnection.on).toHaveBeenCalledWith('GameStarted', expect.any(Function));
        expect(mockConnection.on).toHaveBeenCalledWith('SquareMarked', expect.any(Function));
        expect(mockConnection.on).toHaveBeenCalledWith('Connected', expect.any(Function));
      });

      const connectPromise = service.connect('room-1');
      await flushMicrotasks();
      mockConnection.emit('Connected');
      await connectPromise;
    });
  });
});
