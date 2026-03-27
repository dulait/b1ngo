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
    try {
      await this.authService.login(this.email.value().trim(), this.password.value());
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
    }

    return valid;
  }
}
