import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
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
import { formField } from '@core/utils/form-field';

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
  readonly displayName = formField(this.auth.currentUser()?.displayName ?? '');

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.displayName.reset(user.displayName);
      }
    });
  }
  readonly savingProfile = signal(false);

  // Change password form
  readonly currentPassword = formField();
  readonly newPassword = formField();
  readonly confirmPassword = formField();
  readonly savingPassword = signal(false);

  // Danger zone
  readonly deleteConfirmOpen = signal(false);
  readonly deleteConfirmEmail = signal('');
  readonly deletingAccount = signal(false);

  readonly email = computed(() => this.auth.currentUser()?.email ?? '');
  readonly avatarColor = computed(() => getAvatarColor(this.displayName.value()));
  readonly avatarInitials = computed(() => getAvatarInitials(this.displayName.value()));
  readonly canDelete = computed(() => this.deleteConfirmEmail() === this.email());

  // Profile
  async onSaveProfile(): Promise<void> {
    if (this.savingProfile()) {
      return;
    }

    const name = this.displayName.value().trim();
    if (!name) {
      this.displayName.error.set('Display name is required.');
      return;
    }
    if (name.length > 50) {
      this.displayName.error.set('Display name must be 50 characters or less.');
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
      this.currentPassword.reset();
      this.newPassword.reset();
      this.confirmPassword.reset();
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

    if (!this.currentPassword.value()) {
      this.currentPassword.error.set('Current password is required.');
      valid = false;
    }

    if (!this.newPassword.value()) {
      this.newPassword.error.set('New password is required.');
      valid = false;
    } else if (this.newPassword.value().length < 8) {
      this.newPassword.error.set('Password must be at least 8 characters.');
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
