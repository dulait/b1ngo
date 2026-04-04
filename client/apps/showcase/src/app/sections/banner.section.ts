import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngBannerComponent, BngButtonComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-banner',
  standalone: true,
  imports: [BngBannerComponent, BngButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Banner</h2>
    <p class="text-sm text-text-secondary mb-6">
      Inline notification banner in accent or error variants, with optional dismiss and action buttons.
    </p>

    <div class="space-y-6">
      <bng-card header="Accent (default)">
        @if (!accentDismissed()) {
          <bng-banner variant="accent" (dismissed)="accentDismissed.set(true)">
            <span class="text-sm font-medium">Room code copied to clipboard.</span>
          </bng-banner>
        } @else {
          <bng-button variant="secondary" size="sm" (clicked)="accentDismissed.set(false)">
            Reset
          </bng-button>
        }
      </bng-card>

      <bng-card header="Error">
        @if (!errorDismissed()) {
          <bng-banner variant="error" (dismissed)="errorDismissed.set(true)">
            <span class="text-sm font-medium">Connection lost. Reconnecting...</span>
          </bng-banner>
        } @else {
          <bng-button variant="secondary" size="sm" (clicked)="errorDismissed.set(false)">
            Reset
          </bng-button>
        }
      </bng-card>

      <bng-card header="With action button">
        <bng-banner variant="error" [dismissible]="false">
          <span class="text-sm font-medium">Unable to reconnect.</span>
          <bng-button bannerAction variant="primary" size="sm">Retry</bng-button>
        </bng-banner>
      </bng-card>

      <bng-card header="Non-dismissible">
        <bng-banner variant="accent" [dismissible]="false">
          <span class="text-sm font-medium">A new version is available.</span>
        </bng-banner>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerSection {
  readonly accentDismissed = signal(false);
  readonly errorDismissed = signal(false);
}
