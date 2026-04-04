import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'bng-status-page',
  standalone: true,
  host: { style: 'display: flex; flex: 1; min-height: 0' },
  template: `
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="flex flex-col items-center text-center max-w-xs">
        <div [class]="iconColor()">
          <svg
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            [innerHTML]="safeIcon()"
          ></svg>
        </div>

        <h1 class="text-lg font-semibold text-text-primary mt-4">
          {{ title() }}
        </h1>

        @if (description()) {
          <p class="text-sm text-text-secondary mt-2">
            {{ description() }}
          </p>
        }

        <div class="mt-6">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngStatusPageComponent {
  private readonly sanitizer = inject(DomSanitizer);

  icon = input.required<string>();
  iconColor = input('text-text-secondary');
  title = input.required<string>();
  description = input<string | undefined>(undefined);

  protected safeIcon = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.icon()),
  );
}
