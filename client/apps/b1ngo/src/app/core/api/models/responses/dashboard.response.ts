export interface DashboardResponse {
  displayName: string;
  activeRooms: ActiveRoomDto[];
  totalActiveRooms: number;
  quickStats: QuickStatsDto;
}

export interface ActiveRoomDto {
  roomId: string;
  playerId: string;
  gpName: string;
  sessionType: string;
  playerCount: number;
  status: 'Lobby' | 'Active';
  isHost: boolean;
  joinedAt: string;
}

export interface QuickStatsDto {
  gamesPlayed: number;
  wins: number;
  winRate: number;
}
