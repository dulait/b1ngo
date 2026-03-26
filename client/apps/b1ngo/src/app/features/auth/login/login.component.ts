import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BngCardComponent, BngInputComponent, BngButtonComponent, ToastService } from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  onEmailChange(value: string): void {
    this.email.set(value);
    if (this.emailError()) {
      this.emailError.set(null);
    }
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
    if (this.passwordError()) {
      this.passwordError.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    let valid = true;
    if (!this.email().trim()) {
      this.emailError.set('Required.');
      valid = false;
    }
    if (!this.password()) {
      this.passwordError.set('Required.');
      valid = false;
    }
    if (!valid) {
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.login(this.email().trim(), this.password());
      this.toast.success('Logged in successfully.');
      this.router.navigate(['/']);
    } catch {
      // Error interceptor handles toast display
    } finally {
      this.loading.set(false);
    }
  }

  onExternalLogin(provider: 'Google' | 'Microsoft'): void {
    this.authService.externalLogin(provider);
  }
}
