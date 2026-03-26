import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <main class="min-h-dvh flex flex-col items-center justify-center p-4">
      <a routerLink="/" class="font-mono font-bold text-2xl text-accent mb-6">B1NGO</a>
      <div class="w-full max-w-md">
        <router-outlet />
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
