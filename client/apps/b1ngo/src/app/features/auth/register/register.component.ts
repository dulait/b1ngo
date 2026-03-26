import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BngCardComponent, BngInputComponent, BngButtonComponent, ToastService } from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly email = signal('');
  readonly password = signal('');
  readonly displayName = signal('');
  readonly loading = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly displayNameError = signal<string | null>(null);

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

  onDisplayNameChange(value: string): void {
    this.displayName.set(value);
    if (this.displayNameError()) {
      this.displayNameError.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    let valid = true;
    if (!this.displayName().trim()) {
      this.displayNameError.set('Required.');
      valid = false;
    }
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
}
