import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { BngIconComponent, bngIconChevronLeft } from 'bng-ui';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, BngIconComponent],
  template: `
    <a
      routerLink="/"
      class="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
    >
      <bng-icon [icon]="chevronLeftIcon" size="sm" />
      Back to home
    </a>
    <main class="min-h-dvh flex flex-col items-center justify-center p-4">
      <a routerLink="/" class="font-mono font-bold text-2xl text-accent mb-6">B1NGO</a>
      <div class="w-full max-w-md">
        <router-outlet />
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  protected readonly chevronLeftIcon = bngIconChevronLeft;
}
