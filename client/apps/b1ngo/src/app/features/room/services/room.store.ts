import { signal, computed } from '@angular/core';
import { RoomStatus } from '@core/api/models/types';
import {
  SessionDto,
  ConfigurationDto,
  PlayerDto,
  LeaderboardEntryDto,
  SquareDto,
} from '@core/api/models/dtos';
import { GetRoomStateResponse } from '@core/api/models/responses';
import type { PlayerChipItem, LeaderboardItem } from 'bng-ui';
import { formatDuration } from 'bng-ui';

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

  readonly playerChipItems = computed<PlayerChipItem[]>(() =>
    this.players().map((p) => ({
      id: p.playerId,
      displayName: p.displayName,
      isHost: p.playerId === this.hostPlayerId(),
      isCurrentUser: p.playerId === this.currentPlayerId(),
    })),
  );

  readonly leaderboardItems = computed<LeaderboardItem[]>(() =>
    this.leaderboard().map((e) => {
      const player = this.players().find((p) => p.playerId === e.playerId);
      const timing =
        e.intervalToPrevious !== null
          ? formatDuration(e.intervalToPrevious, '+')
          : formatDuration(e.elapsedTime);
      return {
        rank: e.rank,
        displayName: player?.displayName ?? 'Unknown',
        badge: e.winningPattern,
        timestamp: e.completedAt,
        timing,
        isCurrentUser: e.playerId === this.currentPlayerId(),
      };
    }),
  );

  readonly sessionInfo = computed<{ grandPrixShort: string; sessionType: string } | null>(() => {
    const session = this.session();
    if (!session) {
      return null;
    }
    const words = session.grandPrixName.split(' ');
    const short =
      words.length >= 2
        ? words[0].substring(0, 3).toUpperCase()
        : session.grandPrixName.substring(0, 3).toUpperCase();
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

  refresh(state: GetRoomStateResponse): void {
    this.status.set(state.status);
    this.players.set(state.players);
    this.leaderboard.set(state.leaderboard);
    this.hostPlayerId.set(state.hostPlayerId);
  }

  addPlayer(playerId: string, displayName: string): void {
    this.players.update((list) => [...list, { playerId, displayName, hasWon: false, card: null }]);
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

  addLeaderboardEntry(entry: LeaderboardEntryDto): void {
    this.leaderboard.update((list) => [
      ...list.filter((e) => e.playerId !== entry.playerId),
      entry,
    ]);
  }

  removeLeaderboardEntry(playerId: string): void {
    this.leaderboard.update((list) => list.filter((e) => e.playerId !== playerId));
  }

  setPlayerWon(playerId: string): void {
    this.players.update((list) =>
      list.map((p) => (p.playerId === playerId ? { ...p, hasWon: true } : p)),
    );
  }

  revokePlayerWon(playerId: string): void {
    this.players.update((list) =>
      list.map((p) => (p.playerId === playerId ? { ...p, hasWon: false } : p)),
    );
  }

  // --- Deduplication for optimistic updates ---
  private readonly pendingCorrelations = new Set<string>();

  addPendingCorrelation(id: string): void {
    this.pendingCorrelations.add(id);
  }

  removePendingCorrelation(id: string): void {
    this.pendingCorrelations.delete(id);
  }

  isPendingCorrelation(id: string | undefined): boolean {
    if (!id) {
      return false;
    }

    return this.pendingCorrelations.delete(id);
  }
}
