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
  selector: 'bng-icon',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [attr.width]="resolvedSize()"
      [attr.height]="resolvedSize()"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="safeIcon()"
    ></svg>
  `,
  styles: `
    bng-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  icon = input.required<string>();
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  viewBox = input<string>('0 0 24 24');
  strokeWidth = input<string>('2');

  protected readonly sizeMap: Record<string, string> = {
    xs: '12',
    sm: '14',
    md: '16',
    lg: '20',
  };

  protected resolvedSize = computed(() => this.sizeMap[this.size()]);

  protected safeIcon = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.icon()));
}
