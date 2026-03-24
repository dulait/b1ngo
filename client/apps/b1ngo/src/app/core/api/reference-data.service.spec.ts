import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, beforeEach, expect } from 'vitest';
import { ReferenceDataService } from './reference-data.service';
import { ENVIRONMENT } from '../environment/environment.token';
import { ReferenceDataResponse } from './models/responses';

describe('ReferenceDataService', () => {
  let service: ReferenceDataService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://test-api.example.com';

  const mockResponse: ReferenceDataResponse = {
    seasons: [2025, 2026],
    grandPrix: [
      { name: 'Bahrain Grand Prix', season: 2026, round: 1, isSprint: false, sessionTypes: ['FP1', 'Qualifying', 'Race'] },
      { name: 'Saudi Arabian Grand Prix', season: 2026, round: 2, isSprint: false, sessionTypes: ['FP1', 'Qualifying', 'Race'] },
      { name: 'Australian Grand Prix', season: 2025, round: 1, isSprint: false, sessionTypes: ['FP1', 'Qualifying', 'Race'] },
      { name: 'Chinese Grand Prix', season: 2026, round: 3, isSprint: true, sessionTypes: ['SprintQualifying', 'Sprint', 'Qualifying', 'Race'] },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: baseUrl, version: '0.0.0' } },
      ],
    });
    service = TestBed.inject(ReferenceDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should expose empty seasons and grandPrix before load', () => {
    expect(service.seasons()).toEqual([]);
    expect(service.grandPrix()).toEqual([]);
  });

  it('should GET reference data on load', () => {
    service.load();

    const req = httpMock.expectOne(`${baseUrl}/api/v1/reference-data`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.seasons()).toEqual([2025, 2026]);
    expect(service.grandPrix()).toHaveLength(4);
  });

  it('should not make a second HTTP call if data is already loaded', () => {
    service.load();
    httpMock.expectOne(`${baseUrl}/api/v1/reference-data`).flush(mockResponse);

    service.load();

    httpMock.expectNone(`${baseUrl}/api/v1/reference-data`);
  });

  it('should filter and sort grand prix by season', () => {
    service.load();
    httpMock.expectOne(`${baseUrl}/api/v1/reference-data`).flush(mockResponse);

    const gp2026 = service.grandPrixBySeason(2026)();

    expect(gp2026).toHaveLength(3);
    expect(gp2026[0].name).toBe('Bahrain Grand Prix');
    expect(gp2026[1].name).toBe('Saudi Arabian Grand Prix');
    expect(gp2026[2].name).toBe('Chinese Grand Prix');
  });

  it('should return empty array for a season with no data', () => {
    service.load();
    httpMock.expectOne(`${baseUrl}/api/v1/reference-data`).flush(mockResponse);

    const gp2024 = service.grandPrixBySeason(2024)();

    expect(gp2024).toEqual([]);
  });

  it('should return grand prix sorted by round number', () => {
    service.load();
    httpMock.expectOne(`${baseUrl}/api/v1/reference-data`).flush(mockResponse);

    const gp2026 = service.grandPrixBySeason(2026)();
    const rounds = gp2026.map((gp) => gp.round);

    expect(rounds).toEqual([1, 2, 3]);
  });
});
