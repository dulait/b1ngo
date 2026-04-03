import { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  ReferenceDataResponse,
  CreateRoomCommand,
  CreateRoomResponse,
  JoinRoomResponse,
  GetRoomStateResponse,
} from '../../src/app/shared/types/api.types';
import type { MarkSquareResult, UnmarkSquareResult } from './types';

export class ApiHelper {
  private referenceDataCache: ReferenceDataResponse | null = null;

  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
  ) {}

  async getReferenceData(): Promise<ReferenceDataResponse> {
    if (this.referenceDataCache) { return this.referenceDataCache; }
    const response = await this.request.get(`${this.baseUrl}/api/v1/reference-data`);
    if (!response.ok()) {
      throw new Error(`getReferenceData failed: ${response.status()} ${response.statusText()}`);
    }
    this.referenceDataCache = (await response.json()) as ReferenceDataResponse;
    return this.referenceDataCache;
  }

  async getDefaultRoomOptions(): Promise<{
    season: number;
    grandPrixName: string;
    sessionType: string;
  }> {
    const refData = await this.getReferenceData();
    const firstSeason = refData.seasons[0];
    const firstGp = refData.grandPrix.find((gp) => gp.season === firstSeason)!;
    return {
      season: firstSeason,
      grandPrixName: firstGp.name,
      sessionType: firstGp.sessionTypes[0],
    };
  }

  async createRoom(options?: Partial<CreateRoomCommand>): Promise<CreateRoomResponse & { playerToken: string }> {
    const defaults = await this.getDefaultRoomOptions();
    const data: CreateRoomCommand = {
      hostDisplayName: options?.hostDisplayName ?? `Host_${Date.now()}`,
      season: options?.season ?? defaults.season,
      grandPrixName: options?.grandPrixName ?? defaults.grandPrixName,
      sessionType: (options?.sessionType ?? defaults.sessionType) as CreateRoomCommand['sessionType'],
      ...(options?.matrixSize && { matrixSize: options.matrixSize }),
      ...(options?.winningPatterns && { winningPatterns: options.winningPatterns }),
    };

    const response = await this.request.post(`${this.baseUrl}/api/v1/rooms`, { data });
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`createRoom failed: ${response.status()} ${body}`);
    }

    const playerToken = this.extractPlayerToken(response);
    const body = (await response.json()) as CreateRoomResponse;
    return { ...body, playerToken };
  }

  async joinRoom(joinCode: string, displayName: string): Promise<JoinRoomResponse & { playerToken: string }> {
    const response = await this.request.post(`${this.baseUrl}/api/v1/rooms/join`, {
      data: { joinCode, displayName },
    });
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`joinRoom failed: ${response.status()} ${body}`);
    }

    const playerToken = this.extractPlayerToken(response);
    const body = (await response.json()) as JoinRoomResponse;
    return { ...body, playerToken };
  }

  async getRoomState(roomId: string, playerToken: string): Promise<GetRoomStateResponse> {
    const response = await this.request.get(`${this.baseUrl}/api/v1/rooms/${roomId}`, {
      headers: { 'X-Player-Token': playerToken },
    });
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`getRoomState failed: ${response.status()} ${body}`);
    }
    return (await response.json()) as GetRoomStateResponse;
  }

  async startGame(roomId: string, playerToken: string): Promise<void> {
    const response = await this.request.post(`${this.baseUrl}/api/v1/rooms/${roomId}/start`, {
      headers: { 'X-Player-Token': playerToken },
    });
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`startGame failed: ${response.status()} ${body}`);
    }
  }

  async endGame(roomId: string, playerToken: string): Promise<void> {
    const response = await this.request.post(`${this.baseUrl}/api/v1/rooms/${roomId}/end`, {
      headers: { 'X-Player-Token': playerToken },
    });
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`endGame failed: ${response.status()} ${body}`);
    }
  }

  async editSquare(
    roomId: string,
    row: number,
    col: number,
    displayText: string,
    playerToken: string,
  ): Promise<void> {
    const response = await this.request.put(
      `${this.baseUrl}/api/v1/rooms/${roomId}/players/me/card/squares/${row}/${col}`,
      {
        headers: { 'X-Player-Token': playerToken },
        data: { displayText },
      },
    );
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`editSquare failed: ${response.status()} ${body}`);
    }
  }

  async markSquare(
    roomId: string,
    playerId: string,
    row: number,
    col: number,
    playerToken: string,
  ): Promise<MarkSquareResult> {
    const response = await this.request.post(
      `${this.baseUrl}/api/v1/rooms/${roomId}/players/${playerId}/card/squares/${row}/${col}/mark`,
      { headers: { 'X-Player-Token': playerToken } },
    );
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`markSquare failed: ${response.status()} ${body}`);
    }
    return (await response.json()) as MarkSquareResult;
  }

  async unmarkSquare(
    roomId: string,
    playerId: string,
    row: number,
    col: number,
    playerToken: string,
  ): Promise<UnmarkSquareResult> {
    const response = await this.request.post(
      `${this.baseUrl}/api/v1/rooms/${roomId}/players/${playerId}/card/squares/${row}/${col}/unmark`,
      { headers: { 'X-Player-Token': playerToken } },
    );
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`unmarkSquare failed: ${response.status()} ${body}`);
    }
    return (await response.json()) as UnmarkSquareResult;
  }

  async markSquareRaw(
    roomId: string,
    playerId: string,
    row: number,
    col: number,
    playerToken: string,
  ): Promise<APIResponse> {
    return this.request.post(
      `${this.baseUrl}/api/v1/rooms/${roomId}/players/${playerId}/card/squares/${row}/${col}/mark`,
      { headers: { 'X-Player-Token': playerToken } },
    );
  }

  async endGameRaw(roomId: string, playerToken: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/api/v1/rooms/${roomId}/end`, {
      headers: { 'X-Player-Token': playerToken },
    });
  }

  async reconnect(playerToken: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/api/v1/rooms/reconnect`, {
      headers: { 'X-Player-Token': playerToken },
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request.get(`${this.baseUrl}/health`);
      return response.ok();
    } catch {
      return false;
    }
  }

  private extractPlayerToken(response: APIResponse): string {
    const cookie = response.headersArray()
      .find(h => h.name.toLowerCase() === 'set-cookie' && h.value.startsWith('__bng_s='));
    if (!cookie) {
      throw new Error('No __bng_s cookie in response');
    }
    return cookie.value.split('=', 2)[1].split(';')[0];
  }
}
