import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from '../environment';
import {
  CreateRoomCommand,
  CreateRoomResponse,
  JoinRoomCommand,
  JoinRoomResponse,
  ReconnectResponse,
  GetRoomStateResponse,
} from '../../shared/types/api.types';

@Injectable({ providedIn: 'root' })
export class RoomApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ENVIRONMENT).apiBaseUrl;

  createRoom(cmd: CreateRoomCommand): Promise<CreateRoomResponse> {
    return firstValueFrom(this.http.post<CreateRoomResponse>(`${this.baseUrl}/api/v1/rooms`, cmd));
  }

  joinRoom(cmd: JoinRoomCommand): Promise<JoinRoomResponse> {
    return firstValueFrom(
      this.http.post<JoinRoomResponse>(`${this.baseUrl}/api/v1/rooms/join`, cmd),
    );
  }

  reconnect(): Promise<ReconnectResponse> {
    return firstValueFrom(
      this.http.post<ReconnectResponse>(`${this.baseUrl}/api/v1/rooms/reconnect`, {}),
    );
  }

  getRoomState(roomId: string): Promise<GetRoomStateResponse> {
    return firstValueFrom(
      this.http.get<GetRoomStateResponse>(`${this.baseUrl}/api/v1/rooms/${roomId}`),
    );
  }

  startGame(roomId: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.baseUrl}/api/v1/rooms/${roomId}/start`, {}));
  }

  endGame(roomId: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.baseUrl}/api/v1/rooms/${roomId}/end`, {}));
  }

  editSquare(roomId: string, row: number, col: number, text: string): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(
        `${this.baseUrl}/api/v1/rooms/${roomId}/players/me/card/squares/${row}/${col}`,
        { displayText: text },
      ),
    );
  }

  markSquare(roomId: string, playerId: string, row: number, col: number, correlationId?: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/rooms/${roomId}/players/${playerId}/card/squares/${row}/${col}/mark`;
    const options = correlationId
      ? { headers: { 'X-Correlation-Id': correlationId } }
      : {};
    return firstValueFrom(this.http.post<void>(url, {}, options));
  }

  unmarkSquare(roomId: string, playerId: string, row: number, col: number, correlationId?: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/rooms/${roomId}/players/${playerId}/card/squares/${row}/${col}/unmark`;
    const options = correlationId
      ? { headers: { 'X-Correlation-Id': correlationId } }
      : {};
    return firstValueFrom(this.http.post<void>(url, {}, options));
  }
}
