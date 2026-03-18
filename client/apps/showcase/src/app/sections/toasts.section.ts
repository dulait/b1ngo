import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { BngButtonComponent, BngCardComponent, ToastService } from 'bng-ui';

@Component({
  selector: 'ds-toasts',
  standalone: true,
  imports: [BngButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Toasts</h2>
    <p class="text-sm text-text-secondary mb-6">
      Notification toasts triggered via ToastService in info, success, warning, and error variants.
    </p>

    <bng-card header="Fire Toasts">
      <div class="flex flex-wrap gap-3">
        <bng-button variant="secondary" (clicked)="toast.info('Room code copied to clipboard.')"
          >Info</bng-button
        >
        <bng-button variant="secondary" (clicked)="toast.success('Bingo! You completed a row.')"
          >Success</bng-button
        >
        <bng-button variant="secondary" (clicked)="toast.warning('Session is about to expire.')"
          >Warning</bng-button
        >
        <bng-button variant="danger" (clicked)="toast.error('Connection lost. Reconnecting...')"
          >Error</bng-button
        >
      </div>
    </bng-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastsSection {
  protected readonly toast = inject(ToastService);
}
