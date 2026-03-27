import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngInputComponent,
  BngButtonComponent,
  BngIconComponent,
  ToastService,
  bngIconCheckCircle,
} from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';
import { formField } from '@core/utils/form-field';

@Component({
  selector: 'app-reset-password',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, BngIconComponent, RouterLink],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly checkIcon = bngIconCheckCircle;

  readonly newPassword = formField();
  readonly confirmPassword = formField();
  readonly loading = signal(false);
  readonly success = signal(false);

  private token = '';
  private email = '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.token = params.get('token') ?? '';
    this.email = params.get('email') ?? '';

    if (!this.token || !this.email) {
      this.toast.info('Invalid reset link. Please request a new one.');
      this.router.navigate(['/auth/forgot-password'], { replaceUrl: true });
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
      const ok = await this.auth.resetPassword(this.email, this.token, this.newPassword.value());
      if (ok) {
        this.success.set(true);
      } else {
        this.toast.error('Unable to reset password. Please request a new link.');
        this.router.navigate(['/auth/forgot-password'], { replaceUrl: true });
      }
    } finally {
      this.loading.set(false);
    }
  }

  private validate(): boolean {
    let valid = true;

    if (!this.newPassword.value()) {
      this.newPassword.error.set('Password is required.');
      valid = false;
    } else if (this.newPassword.value().length < 8) {
      this.newPassword.error.set('Password must be at least 8 characters.');
      valid = false;
    } else if (!/\d/.test(this.newPassword.value())) {
      this.newPassword.error.set('Password must contain at least one digit.');
      valid = false;
    }

    if (!this.confirmPassword.value()) {
      this.confirmPassword.error.set('Please confirm your password.');
      valid = false;
    } else if (this.confirmPassword.value() !== this.newPassword.value()) {
      this.confirmPassword.error.set('Passwords do not match.');
      valid = false;
    }

    return valid;
  }
}
