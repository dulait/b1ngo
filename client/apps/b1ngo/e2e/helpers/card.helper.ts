import type { ApiHelper } from './api.helper';
import type { CardDto, SquareDto } from '../../src/app/shared/types/api.types';
import type { MarkSquareResult } from './types';

export interface Coord {
  row: number;
  col: number;
}

export function getSquaresForRow(card: CardDto, rowIndex: number): Coord[] {
  const coords: Coord[] = [];
  for (let col = 0; col < card.matrixSize; col++) {
    coords.push({ row: rowIndex, col });
  }
  return coords;
}

export function getSquaresForColumn(card: CardDto, colIndex: number): Coord[] {
  const coords: Coord[] = [];
  for (let row = 0; row < card.matrixSize; row++) {
    coords.push({ row, col: colIndex });
  }
  return coords;
}

export function getSquaresForMainDiagonal(card: CardDto): Coord[] {
  const coords: Coord[] = [];
  for (let i = 0; i < card.matrixSize; i++) {
    coords.push({ row: i, col: i });
  }
  return coords;
}

export function getSquaresForAntiDiagonal(card: CardDto): Coord[] {
  const coords: Coord[] = [];
  for (let i = 0; i < card.matrixSize; i++) {
    coords.push({ row: i, col: card.matrixSize - 1 - i });
  }
  return coords;
}

export function getAllSquares(card: CardDto): Coord[] {
  const coords: Coord[] = [];
  for (let row = 0; row < card.matrixSize; row++) {
    for (let col = 0; col < card.matrixSize; col++) {
      coords.push({ row, col });
    }
  }
  return coords;
}

export function getUnmarkedSquares(card: CardDto, targets: Coord[]): Coord[] {
  return targets.filter((t) => {
    const square = card.squares.find((s) => s.row === t.row && s.column === t.col);
    return square && !square.isMarked;
  });
}

export function getSquareAt(card: CardDto, row: number, col: number): SquareDto | undefined {
  return card.squares.find((s) => s.row === row && s.column === col);
}

export type PatternType = 'row' | 'column' | 'main-diagonal' | 'anti-diagonal' | 'blackout';

export function getTargetSquares(
  card: CardDto,
  pattern: PatternType,
  index?: number,
): Coord[] {
  switch (pattern) {
    case 'row':
      return getSquaresForRow(card, index ?? 0);
    case 'column':
      return getSquaresForColumn(card, index ?? 0);
    case 'main-diagonal':
      return getSquaresForMainDiagonal(card);
    case 'anti-diagonal':
      return getSquaresForAntiDiagonal(card);
    case 'blackout':
      return getAllSquares(card);
  }
}

export async function completePattern(
  api: ApiHelper,
  roomId: string,
  playerId: string,
  playerToken: string,
  pattern: PatternType,
  index?: number,
): Promise<MarkSquareResult | undefined> {
  const state = await api.getRoomState(roomId, playerToken);
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player?.card) {throw new Error(`Player ${playerId} has no card`);}

  const targets = getTargetSquares(player.card, pattern, index);
  const toMark = getUnmarkedSquares(player.card, targets);

  let lastResult: MarkSquareResult | undefined;
  for (const coord of toMark) {
    lastResult = await api.markSquare(roomId, playerId, coord.row, coord.col, playerToken);
  }
  return lastResult;
}

export async function completePatternExceptLast(
  api: ApiHelper,
  roomId: string,
  playerId: string,
  playerToken: string,
  pattern: PatternType,
  index?: number,
): Promise<Coord> {
  const state = await api.getRoomState(roomId, playerToken);
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player?.card) {throw new Error(`Player ${playerId} has no card`);}

  const targets = getTargetSquares(player.card, pattern, index);
  const toMark = getUnmarkedSquares(player.card, targets);

  if (toMark.length === 0) {throw new Error('All target squares already marked');}

  const allButLast = toMark.slice(0, -1);
  const last = toMark[toMark.length - 1];

  for (const coord of allButLast) {
    await api.markSquare(roomId, playerId, coord.row, coord.col, playerToken);
  }

  return last;
}
