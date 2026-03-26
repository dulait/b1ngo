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
  selector: 'app-register',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, BngIconComponent, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly googleIcon = bngIconGoogle;
  readonly microsoftIcon = bngIconMicrosoft;
  readonly socialViewBox = bngIconSocialViewBox;

  readonly displayName = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly displayNameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  onDisplayNameChange(value: string): void {
    this.displayName.set(value);
    if (this.displayNameError() && value.trim()) {
      this.displayNameError.set(null);
    }
  }

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
      await this.authService.register(
        this.email().trim(),
        this.password(),
        this.displayName().trim(),
      );
      this.toast.success('Account created successfully.');
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

    const name = this.displayName().trim();
    if (!name) {
      this.displayNameError.set('Display name is required.');
      valid = false;
    } else if (name.length > 50) {
      this.displayNameError.set('Display name must be 50 characters or less.');
      valid = false;
    }

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
    } else if (this.password().length < 8) {
      this.passwordError.set('Password must be at least 8 characters.');
      valid = false;
    }

    return valid;
  }
}
