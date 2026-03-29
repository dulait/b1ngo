import { ActiveRoomDto } from './dashboard.response';

export interface HistoryResponse {
  activeRooms: ActiveRoomDto[];
  completedRooms: PagedResult<CompletedRoomDto>;
}

export interface CompletedRoomDto {
  roomId: string;
  gpName: string;
  sessionType: string;
  playerCount: number;
  completedAt: string;
  resultRank: number | null;
  winPattern: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
