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
  readonly ready = signal(false);

  async checkAuth(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<UserInfo>(`${this.baseUrl}/api/v1/auth/me`, { observe: 'response' }),
      );
      this.currentUser.set(res.status === 200 && res.body ? res.body : null);
    } catch {
      this.currentUser.set(null);
    } finally {
      this.ready.set(true);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/api/v1/auth/login`, { email, password }),
    );
    this.currentUser.set(res);
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/api/v1/auth/register`, {
        email,
        password,
        displayName,
      }),
    );
    this.currentUser.set(res);
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/api/v1/auth/logout`, {}));
    this.currentUser.set(null);
  }

  async forgotPassword(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/forgot-password`, { email }),
    );
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/reset-password`, { email, token, newPassword }),
    );
  }

  async updateProfile(displayName: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.put<AuthResponse>(`${this.baseUrl}/api/v1/auth/profile`, { displayName }),
    );
    this.currentUser.set(res);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/change-password`, {
        currentPassword,
        newPassword,
      }),
    );
  }

  async deleteAccount(email: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/api/v1/auth/account`, { body: { email } }),
    );
    this.currentUser.set(null);
  }

  externalLogin(provider: 'Google' | 'Microsoft'): void {
    window.location.href = `${this.baseUrl}/api/v1/auth/external-login/${provider}`;
  }
}
