import { signal, computed } from '@angular/core';
import {
  RoomStatus,
  SessionDto,
  ConfigurationDto,
  PlayerDto,
  LeaderboardEntryDto,
  SquareDto,
  GetRoomStateResponse,
} from '../../shared/types/api.types';
import {
  PlayerDto as UiPlayerDto,
  LeaderboardEntryDto as UiLeaderboardEntryDto,
  SessionDto as UiSessionDto,
} from 'bng-ui';

export class RoomStore {
  readonly roomId = signal('');
  readonly joinCode = signal('');
  readonly status = signal<RoomStatus>('Lobby');
  readonly session = signal<SessionDto | null>(null);
  readonly configuration = signal<ConfigurationDto | null>(null);
  readonly hostPlayerId = signal('');
  readonly players = signal<PlayerDto[]>([]);
  readonly leaderboard = signal<LeaderboardEntryDto[]>([]);
  readonly currentPlayerId = signal('');

  readonly isHost = computed(() => this.currentPlayerId() === this.hostPlayerId());
  readonly currentPlayer = computed(
    () => this.players().find((p) => p.playerId === this.currentPlayerId()) ?? null,
  );
  readonly currentCard = computed(() => this.currentPlayer()?.card ?? null);

  readonly matrixSize = computed(() => this.configuration()?.matrixSize ?? 5);

  readonly uiPlayers = computed<UiPlayerDto[]>(() =>
    this.players().map((p) => ({ playerId: p.playerId, displayName: p.displayName })),
  );

  readonly uiLeaderboard = computed<UiLeaderboardEntryDto[]>(() =>
    this.leaderboard().map((e) => ({
      rank: e.rank,
      playerId: e.playerId,
      pattern: e.winningPattern,
      completedAt: e.completedAt,
    })),
  );

  readonly uiSession = computed<UiSessionDto | null>(() => {
    const session = this.session();
    if (!session) {
      return null;
    }
    // todo: find a better way to get short names; possibly return from backend
    const words = session.grandPrixName.split(' ');
    const short = words.length >= 2 ? words[0].substring(0, 3).toUpperCase() : session.grandPrixName.substring(0, 3).toUpperCase();
    return { grandPrixShort: short, sessionType: session.sessionType };
  });

  initialize(state: GetRoomStateResponse, currentPlayerId: string): void {
    this.roomId.set(state.roomId);
    this.joinCode.set(state.joinCode);
    this.status.set(state.status);
    this.session.set(state.session);
    this.configuration.set(state.configuration);
    this.hostPlayerId.set(state.hostPlayerId);
    this.players.set(state.players);
    this.leaderboard.set(state.leaderboard);
    this.currentPlayerId.set(currentPlayerId);
  }

  addPlayer(playerId: string, displayName: string): void {
    this.players.update((list) => [
      ...list,
      { playerId, displayName, hasWon: false, card: null },
    ]);
  }

  updateSquare(playerId: string, row: number, col: number, patch: Partial<SquareDto>): void {
    this.players.update((list) =>
      list.map((player) => {
        if (player.playerId !== playerId || !player.card) {
          return player;
        }

        return {
          ...player,
          card: {
            ...player.card,
            squares: player.card.squares.map((s) =>
              s.row === row && s.column === col ? { ...s, ...patch } : s,
            ),
          },
        };
      }),
    );
  }

  setStatus(status: RoomStatus): void {
    this.status.set(status);
  }

  updateLeaderboard(entries: LeaderboardEntryDto[]): void {
    this.leaderboard.set(entries);
  }

  // --- Deduplication for optimistic updates ---
  private readonly markTimestamps = new Map<string, number>();
  private readonly DEDUP_WINDOW_MS = 2000;

  recordMarkTimestamp(row: number, col: number): void {
    this.markTimestamps.set(`${row}:${col}`, Date.now());
  }

  isRecentOptimisticUpdate(row: number, col: number): boolean {
    const key = `${row}:${col}`;
    const timestamp = this.markTimestamps.get(key);

    if (!timestamp) {
      return false;
    }

    if (Date.now() - timestamp < this.DEDUP_WINDOW_MS) {
      return true;
    }

    this.markTimestamps.delete(key);
    return false;
  }
}
