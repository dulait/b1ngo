import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ProfileComponent } from './profile.component';
import { AuthService } from '@core/auth/auth.service';
import { ENVIRONMENT } from '@core/environment/environment.token';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ENVIRONMENT, useValue: { production: false, apiBaseUrl: '' } },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      userId: 'u1',
      email: 'test@test.com',
      displayName: 'TestUser',
      roles: [],
      hasPassword: true,
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders avatar with correct initials derived from display name', () => {
    const avatar = fixture.nativeElement.querySelector('.rounded-full');
    expect(avatar).not.toBeNull();
    expect(avatar.textContent).toContain(component.avatarInitials());
  });

  it('renders display name and email input fields', () => {
    const inputs = fixture.nativeElement.querySelectorAll('bng-input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('email computed signal reflects the current user email', () => {
    expect(component.email()).toBe('test@test.com');
  });

  it('delete confirmation modal opens when openDeleteConfirm() is called', () => {
    expect(component.deleteConfirmOpen()).toBe(false);

    component.openDeleteConfirm();
    fixture.detectChanges();

    expect(component.deleteConfirmOpen()).toBe(true);
  });

  it('delete confirmation modal closes when closeDeleteConfirm() is called', () => {
    component.openDeleteConfirm();
    fixture.detectChanges();
    expect(component.deleteConfirmOpen()).toBe(true);

    component.closeDeleteConfirm();
    fixture.detectChanges();

    expect(component.deleteConfirmOpen()).toBe(false);
  });

  it('canDelete() is false when confirmation email does not match user email', () => {
    component.openDeleteConfirm();
    component.onDeleteConfirmEmailChange('wrong@email.com');
    fixture.detectChanges();

    expect(component.canDelete()).toBe(false);
  });

  it('canDelete() is true when confirmation email matches user email', () => {
    component.openDeleteConfirm();
    component.onDeleteConfirmEmailChange('test@test.com');
    fixture.detectChanges();

    expect(component.canDelete()).toBe(true);
  });

  it('hides change password card when user has no password', () => {
    authService.currentUser.set({
      userId: 'u1',
      email: 'test@test.com',
      displayName: 'TestUser',
      roles: [],
      hasPassword: false,
    });
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('bng-card');
    const headers = Array.from<Element>(cards).map((c) => c.getAttribute('header'));
    expect(headers).not.toContain('Change Password');
  });

  it('shows change password card when user has a password', () => {
    const cards = fixture.nativeElement.querySelectorAll('bng-card');
    const headers = Array.from<Element>(cards).map((c) => c.getAttribute('header'));
    expect(headers).toContain('Change Password');
  });

  it('onDeleteAccount() does nothing when canDelete() is false', async () => {
    component.openDeleteConfirm();
    component.onDeleteConfirmEmailChange('wrong@email.com');

    await component.onDeleteAccount();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
