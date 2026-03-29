import { QuickStatsDto } from './dashboard.response';

export interface StatsResponse {
  overview: QuickStatsDto;
  winsByPattern: WinsByPatternDto;
  bestFinishes: RankCountDto[];
}

export interface WinsByPatternDto {
  row: number;
  column: number;
  diagonal: number;
  blackout: number;
}

export interface RankCountDto {
  rank: number;
  count: number;
}
