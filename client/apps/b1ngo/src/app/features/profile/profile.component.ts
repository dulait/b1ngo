import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { validatePassword } from '@core/utils/validate-password';

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
      await this.auth.updateProfile(name);
      this.toast.success('Profile updated.');
    } catch {
      // Error interceptor handles toast
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
      await this.auth.changePassword(this.currentPassword.value(), this.newPassword.value());
      this.currentPassword.reset();
      this.newPassword.reset();
      this.confirmPassword.reset();
      this.toast.success('Password updated.');
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.error?.code === 'PasswordMismatch') {
        this.currentPassword.error.set('Current password is incorrect.');
      }
      // Other errors handled by error interceptor
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
      await this.auth.deleteAccount(this.deleteConfirmEmail());
      this.deleteConfirmOpen.set(false);
      this.toast.success('Account deleted.');
      this.router.navigate(['/']);
    } catch {
      // Error interceptor handles toast; modal stays open
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

    if (!validatePassword(this.newPassword.value(), this.newPassword.error)) {
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
