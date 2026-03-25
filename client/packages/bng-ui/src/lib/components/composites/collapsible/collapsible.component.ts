import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  model,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { bngIconChevronDown } from '../../../icons/icons';

let nextId = 0;

@Component({
  selector: 'bng-collapsible',
  standalone: true,
  template: `
    <div>
      <button
        type="button"
        class="flex items-center gap-1.5 text-sm text-text-secondary"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="contentId"
        (click)="toggle()"
      >
        <svg
          class="w-3 h-3 transition-transform duration-200"
          [class.rotate-180]="expanded()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          [innerHTML]="chevronIcon"
        ></svg>
        {{ label() }}
        @if (badge() !== null) {
          ({{ badge() }})
        }
      </button>

      @if (expanded()) {
        <div [id]="contentId" role="region" [attr.aria-label]="label()" class="mt-3">
          <ng-content />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngCollapsibleComponent {
  private readonly sanitizer = inject(DomSanitizer);

  label = input.required<string>();
  badge = input<string | number | null>(null);
  expanded = model(false);

  protected readonly chevronIcon = this.sanitizer.bypassSecurityTrustHtml(bngIconChevronDown);

  readonly contentId = `bng-collapsible-${nextId++}`;

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
