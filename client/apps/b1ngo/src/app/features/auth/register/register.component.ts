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
import { formField } from '@core/utils/form-field';

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

  readonly displayName = formField();
  readonly email = formField();
  readonly password = formField();
  readonly loading = signal(false);

  async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    if (!this.validate()) {
      return;
    }

    this.loading.set(true);
    const success = await this.authService.register(
      this.email.value().trim(),
      this.password.value(),
      this.displayName.value().trim(),
    );
    this.loading.set(false);

    if (success) {
      this.toast.success('Account created successfully.');
      this.router.navigate(['/']);
    } else {
      this.toast.error('Registration failed. Please try again.');
    }
  }

  onExternalLogin(provider: 'Google' | 'Microsoft'): void {
    this.authService.externalLogin(provider);
  }

  private validate(): boolean {
    let valid = true;

    const name = this.displayName.value().trim();
    if (!name) {
      this.displayName.error.set('Display name is required.');
      valid = false;
    } else if (name.length > 50) {
      this.displayName.error.set('Display name must be 50 characters or less.');
      valid = false;
    }

    const email = this.email.value().trim();
    if (!email) {
      this.email.error.set('Email is required.');
      valid = false;
    } else if (!email.includes('@')) {
      this.email.error.set('Enter a valid email address.');
      valid = false;
    }

    if (!this.password.value()) {
      this.password.error.set('Password is required.');
      valid = false;
    } else if (this.password.value().length < 8) {
      this.password.error.set('Password must be at least 8 characters.');
      valid = false;
    } else if (!/\d/.test(this.password.value())) {
      this.password.error.set('Password must contain at least one digit.');
      valid = false;
    }

    return valid;
  }
}
