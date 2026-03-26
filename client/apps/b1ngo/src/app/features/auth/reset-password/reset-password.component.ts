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

  readonly checkIcon = bngIconCheckCircle;

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly newPasswordError = signal<string | null>(null);
  readonly confirmPasswordError = signal<string | null>(null);
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

  onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
    if (this.newPasswordError() && value) {
      this.newPasswordError.set(null);
    }
  }

  onConfirmPasswordChange(value: string): void {
    this.confirmPassword.set(value);
    if (this.confirmPasswordError() && value) {
      this.confirmPasswordError.set(null);
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
      // Backend endpoint does not exist yet; simulate success
      await new Promise((r) => setTimeout(r, 500));
      this.success.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private validate(): boolean {
    let valid = true;

    if (!this.newPassword()) {
      this.newPasswordError.set('Password is required.');
      valid = false;
    } else if (this.newPassword().length < 8) {
      this.newPasswordError.set('Password must be at least 8 characters.');
      valid = false;
    }

    if (!this.confirmPassword()) {
      this.confirmPasswordError.set('Please confirm your password.');
      valid = false;
    } else if (this.confirmPassword() !== this.newPassword()) {
      this.confirmPasswordError.set('Passwords do not match.');
      valid = false;
    }

    return valid;
  }
}
