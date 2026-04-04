import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import {
  BngStatusPageComponent,
  BngButtonComponent,
  BngCardComponent,
  bngIconAlertTriangle,
  bngIconHelpCircle,
  bngIconInfoCircle,
  bngIconXCircle,
} from 'bng-ui';

type StatusVariant = 'connection-error' | 'not-found' | 'under-construction' | 'server-error';

interface StatusConfig {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant: 'primary' | 'secondary';
}

const CONFIGS: Record<StatusVariant, StatusConfig> = {
  'connection-error': {
    icon: bngIconAlertTriangle,
    iconColor: 'text-error',
    title: "Can't connect to the server",
    description: 'Check your connection and try again.',
    actionLabel: 'Retry',
    actionVariant: 'primary',
  },
  'not-found': {
    icon: bngIconHelpCircle,
    iconColor: 'text-text-secondary',
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
    actionLabel: 'Go Home',
    actionVariant: 'secondary',
  },
  'under-construction': {
    icon: bngIconInfoCircle,
    iconColor: 'text-accent',
    title: 'Coming Soon',
    description: 'This feature is still being built. Check back later.',
    actionLabel: 'Go Home',
    actionVariant: 'secondary',
  },
  'server-error': {
    icon: bngIconXCircle,
    iconColor: 'text-error',
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    actionLabel: 'Retry',
    actionVariant: 'primary',
  },
};

@Component({
  selector: 'ds-status-page',
  standalone: true,
  imports: [BngStatusPageComponent, BngButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Status Page</h2>
    <p class="text-sm text-text-secondary mb-6">
      Full-page status display for errors, 404s, and placeholder states.
    </p>

    <div class="space-y-6">
      <bng-card header="Variants">
        <div class="flex flex-wrap gap-2 mb-4">
          @for (v of variants; track v) {
            <button
              type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
              [class.border-accent]="variant() === v"
              [class.bg-accent-muted]="variant() === v"
              [class.text-accent]="variant() === v"
              [class.border-border-default]="variant() !== v"
              [class.text-text-secondary]="variant() !== v"
              (click)="variant.set(v)"
            >
              {{ v }}
            </button>
          }
        </div>
        <div class="border border-border-default rounded-lg" style="height: 320px; display: flex">
          <bng-status-page
            [icon]="config().icon"
            [iconColor]="config().iconColor"
            [title]="config().title"
            [description]="config().description"
          >
            <bng-button [variant]="config().actionVariant">
              {{ config().actionLabel }}
            </bng-button>
          </bng-status-page>
        </div>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPageSection {
  readonly variants: StatusVariant[] = [
    'connection-error',
    'not-found',
    'under-construction',
    'server-error',
  ];
  readonly variant = signal<StatusVariant>('connection-error');
  readonly config = computed(() => CONFIGS[this.variant()]);
}
