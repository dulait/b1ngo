import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from '../environment/environment.token';
import { DashboardResponse, HistoryResponse, StatsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class UserActivityApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ENVIRONMENT).apiBaseUrl;

  getDashboard(): Promise<DashboardResponse> {
    return firstValueFrom(
      this.http.get<DashboardResponse>(`${this.baseUrl}/api/v1/dashboard`),
    );
  }

  getHistory(page = 1, pageSize = 10): Promise<HistoryResponse> {
    return firstValueFrom(
      this.http.get<HistoryResponse>(`${this.baseUrl}/api/v1/history`, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      }),
    );
  }

  getStats(): Promise<StatsResponse> {
    return firstValueFrom(this.http.get<StatsResponse>(`${this.baseUrl}/api/v1/stats`));
  }
}
