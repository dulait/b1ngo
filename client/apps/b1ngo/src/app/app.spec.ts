import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, beforeEach, expect } from 'vitest';
import { App } from './app';
import { ENVIRONMENT } from './core/environment';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ENVIRONMENT,
          useValue: { production: false, apiBaseUrl: 'https://test.example.com', version: '0.0.1' },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
