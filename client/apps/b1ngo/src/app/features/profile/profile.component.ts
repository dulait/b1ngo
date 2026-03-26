import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  BngCardComponent,
  BngInputComponent,
  BngButtonComponent,
  BngIconComponent,
  BngModalComponent,
  ToastService,
  getAvatarColor,
  getAvatarInitials,
  bngIconChevronLeft,
} from 'bng-ui';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [
    BngCardComponent,
    BngInputComponent,
    BngButtonComponent,
    BngIconComponent,
    BngModalComponent,
    RouterLink,
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly chevronLeftIcon = bngIconChevronLeft;

  // Profile form
  readonly displayName = signal(this.auth.currentUser()?.displayName ?? '');
  readonly displayNameError = signal<string | null>(null);
  readonly savingProfile = signal(false);

  // Change password form
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly currentPasswordError = signal<string | null>(null);
  readonly newPasswordError = signal<string | null>(null);
  readonly confirmPasswordError = signal<string | null>(null);
  readonly savingPassword = signal(false);

  // Danger zone
  readonly deleteConfirmOpen = signal(false);
  readonly deleteConfirmEmail = signal('');
  readonly deletingAccount = signal(false);

  readonly email = computed(() => this.auth.currentUser()?.email ?? '');
  readonly avatarColor = computed(() => getAvatarColor(this.displayName()));
  readonly avatarInitials = computed(() => getAvatarInitials(this.displayName()));
  readonly canDelete = computed(() => this.deleteConfirmEmail() === this.email());

  // Profile
  onDisplayNameChange(value: string): void {
    this.displayName.set(value);
    if (this.displayNameError() && value.trim()) {
      this.displayNameError.set(null);
    }
  }

  async onSaveProfile(): Promise<void> {
    if (this.savingProfile()) {
      return;
    }

    const name = this.displayName().trim();
    if (!name) {
      this.displayNameError.set('Display name is required.');
      return;
    }
    if (name.length > 50) {
      this.displayNameError.set('Display name must be 50 characters or less.');
      return;
    }

    this.savingProfile.set(true);
    try {
      // Backend endpoint does not exist yet; simulate success
      await new Promise((r) => setTimeout(r, 500));
      this.toast.success('Profile updated.');
    } finally {
      this.savingProfile.set(false);
    }
  }

  // Change password
  onCurrentPasswordChange(value: string): void {
    this.currentPassword.set(value);
    if (this.currentPasswordError() && value) {
      this.currentPasswordError.set(null);
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

  async onChangePassword(): Promise<void> {
    if (this.savingPassword()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    this.savingPassword.set(true);
    try {
      // Backend endpoint does not exist yet; simulate success
      await new Promise((r) => setTimeout(r, 500));
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.toast.success('Password updated.');
    } finally {
      this.savingPassword.set(false);
    }
  }

  // Danger zone
  onDeleteConfirmEmailChange(value: string): void {
    this.deleteConfirmEmail.set(value);
  }

  openDeleteConfirm(): void {
    this.deleteConfirmEmail.set('');
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm(): void {
    this.deleteConfirmOpen.set(false);
  }

  async onDeleteAccount(): Promise<void> {
    if (this.deletingAccount() || !this.canDelete()) {
      return;
    }

    this.deletingAccount.set(true);
    try {
      // Backend endpoint does not exist yet; simulate success
      await new Promise((r) => setTimeout(r, 500));
      this.deleteConfirmOpen.set(false);
      this.toast.success('Account deleted.');
      this.router.navigate(['/']);
    } finally {
      this.deletingAccount.set(false);
    }
  }

  private validatePassword(): boolean {
    let valid = true;

    if (!this.currentPassword()) {
      this.currentPasswordError.set('Current password is required.');
      valid = false;
    }

    if (!this.newPassword()) {
      this.newPasswordError.set('New password is required.');
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
