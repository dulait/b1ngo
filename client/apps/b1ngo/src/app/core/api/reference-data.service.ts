import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GrandPrixOption, ReferenceDataResponse } from '../../shared/types/api.types';

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private readonly http = inject(HttpClient);
  private readonly data = signal<ReferenceDataResponse | null>(null);

  readonly sessionTypes = computed(() => this.data()?.sessionTypes ?? []);
  readonly grandPrix = computed(() => this.data()?.grandPrix ?? []);
  readonly seasons = computed(() =>
    [...new Set(this.grandPrix().map((gp) => gp.season))].sort((a, b) => b - a),
  );

  grandPrixBySeason(season: number): Signal<GrandPrixOption[]> {
    return computed(() =>
      this.grandPrix()
        .filter((gp) => gp.season === season)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }

  load(): void {
    if (this.data()) {
      return;
    }
    this.http.get<ReferenceDataResponse>('/api/v1/reference-data').subscribe((data) => {
      this.data.set(data);
    });
  }
}
