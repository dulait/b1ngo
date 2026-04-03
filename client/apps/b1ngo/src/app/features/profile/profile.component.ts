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
import { safeAsync } from '@core/utils/safe-async.util';
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

  readonly currentPassword = formField();
  readonly newPassword = formField();
  readonly confirmPassword = formField();
  readonly savingPassword = signal(false);

  readonly deleteConfirmOpen = signal(false);
  readonly deleteConfirmEmail = signal('');
  readonly deletingAccount = signal(false);

  readonly email = computed(() => this.auth.currentUser()?.email ?? '');
  readonly avatarColor = computed(() => getAvatarColor(this.displayName.value()));
  readonly avatarInitials = computed(() => getAvatarInitials(this.displayName.value()));
  readonly canDelete = computed(() => this.deleteConfirmEmail() === this.email());

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
    const result = await safeAsync(this.auth.updateProfile(name));
    this.savingProfile.set(false);

    if (result.ok) {
      this.toast.success('Profile updated.');
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
    const result = await safeAsync(
      this.auth.changePassword(this.currentPassword.value(), this.newPassword.value()),
    );
    this.savingPassword.set(false);

    if (result.ok) {
      this.currentPassword.reset();
      this.newPassword.reset();
      this.confirmPassword.reset();
      this.toast.success('Password updated.');
    } else if (
      result.error instanceof HttpErrorResponse &&
      result.error.error?.code === 'PasswordMismatch'
    ) {
      this.currentPassword.error.set('Current password is incorrect.');
    }
  }

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
    const result = await safeAsync(this.auth.deleteAccount(this.deleteConfirmEmail()));
    this.deletingAccount.set(false);

    if (result.ok) {
      this.deleteConfirmOpen.set(false);
      this.toast.success('Account deleted.');
      this.router.navigate(['/']);
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
