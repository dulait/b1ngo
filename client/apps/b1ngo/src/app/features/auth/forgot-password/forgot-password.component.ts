import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngInputComponent,
  BngButtonComponent,
  BngIconComponent,
  bngIconCheckCircle,
} from 'bng-ui';
import { formField } from '@core/utils/form-field';

@Component({
  selector: 'app-forgot-password',
  imports: [BngCardComponent, BngInputComponent, BngButtonComponent, BngIconComponent, RouterLink],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  readonly checkIcon = bngIconCheckCircle;

  readonly email = formField();
  readonly loading = signal(false);
  readonly sent = signal(false);

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
    const email = this.email.value().trim();
    if (!email) {
      this.email.error.set('Email is required.');
      return false;
    }
    if (!email.includes('@')) {
      this.email.error.set('Enter a valid email address.');
      return false;
    }
    return true;
  }
}
