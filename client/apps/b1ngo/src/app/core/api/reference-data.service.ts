import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GrandPrixOption, ReferenceDataResponse } from '../../shared/types/api.types';
import { ENVIRONMENT } from '../environment';

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ENVIRONMENT).apiBaseUrl;
  private readonly data = signal<ReferenceDataResponse | null>(null);

  readonly seasons = computed(() => this.data()?.seasons ?? []);
  readonly grandPrix = computed(() => this.data()?.grandPrix ?? []);

  grandPrixBySeason(season: number): Signal<GrandPrixOption[]> {
    return computed(() =>
      this.grandPrix()
        .filter((gp) => gp.season === season)
        .sort((a, b) => a.round - b.round),
    );
  }

  load(): void {
    if (this.data()) {
      return;
    }
    this.http
      .get<ReferenceDataResponse>(`${this.baseUrl}/api/v1/reference-data`)
      .subscribe((data) => {
        this.data.set(data);
      });
  }
}
