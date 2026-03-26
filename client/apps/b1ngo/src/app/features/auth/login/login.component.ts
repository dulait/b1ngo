import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngInputComponent,
  BngButtonComponent,
  BngIconComponent,
  ToastService,
  bngIconGoogle,
  bngIconMicrosoft,
  bngIconSocialViewBox,
} from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, BngIconComponent, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly googleIcon = bngIconGoogle;
  readonly microsoftIcon = bngIconMicrosoft;
  readonly socialViewBox = bngIconSocialViewBox;

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  onEmailChange(value: string): void {
    this.email.set(value);
    if (this.emailError() && value.trim()) {
      this.emailError.set(null);
    }
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
    if (this.passwordError() && value) {
      this.passwordError.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    if (!this.validate()) {
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

  private validate(): boolean {
    let valid = true;

    const email = this.email().trim();
    if (!email) {
      this.emailError.set('Email is required.');
      valid = false;
    } else if (!email.includes('@')) {
      this.emailError.set('Enter a valid email address.');
      valid = false;
    }

    if (!this.password()) {
      this.passwordError.set('Password is required.');
      valid = false;
    }

    return valid;
  }
}
