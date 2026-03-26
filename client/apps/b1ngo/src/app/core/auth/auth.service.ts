import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from '../environment/environment.token';
import { UserInfo, AuthResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ENVIRONMENT).apiBaseUrl;

  readonly currentUser = signal<UserInfo | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.roles.includes('Admin') ?? false);

  async checkAuth(): Promise<void> {
    try {
      const me = await firstValueFrom(
        this.http.get<UserInfo | null>(`${this.baseUrl}/api/v1/auth/me`),
      );
      this.currentUser.set(me);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/api/v1/auth/login`, { email, password }),
    );
    await this.checkAuth();
    return response;
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/api/v1/auth/register`, { email, password, displayName }),
    );
    await this.checkAuth();
    return response;
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/logout`, {}),
    );
    this.currentUser.set(null);
  }

  externalLogin(provider: 'Google' | 'Microsoft'): void {
    window.location.href = `${this.baseUrl}/api/v1/auth/external-login/${provider}`;
  }
}
