import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngInputComponent,
  BngButtonComponent,
  BngIconComponent,
  bngIconCheckCircle,
} from 'bng-ui';

@Component({
  selector: 'app-forgot-password',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, BngIconComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  readonly checkIcon = bngIconCheckCircle;

  readonly email = signal('');
  readonly loading = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly sent = signal(false);

  onEmailChange(value: string): void {
    this.email.set(value);
    if (this.emailError() && value.trim()) {
      this.emailError.set(null);
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
      this.sent.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private validate(): boolean {
    const email = this.email().trim();
    if (!email) {
      this.emailError.set('Email is required.');
      return false;
    }
    if (!email.includes('@')) {
      this.emailError.set('Enter a valid email address.');
      return false;
    }
    return true;
  }
}
