import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  computed,
} from '@angular/core';

type RoomStatus = 'Lobby' | 'Active' | 'Completed';

interface StatusStyle {
  container: string;
  dot: string;
  text: string;
}

const STATUS_STYLES: Record<RoomStatus, StatusStyle> = {
  Lobby: { container: 'bg-[rgba(234,179,8,0.15)]', dot: 'bg-yellow-500', text: 'text-yellow-500' },
  Active: {
    container: 'bg-[rgba(34,197,94,0.15)]',
    dot: 'bg-green-500 pulse-dot',
    text: 'text-green-500',
  },
  Completed: {
    container: 'bg-[rgba(148,163,184,0.15)]',
    dot: 'bg-slate-400',
    text: 'text-slate-400',
  },
};

@Component({
  selector: 'bng-status-badge',
  standalone: true,
  template: `
    <div role="status" [attr.aria-label]="'Room status: ' + status()" [class]="containerClasses()">
      <span [class]="dotClasses()"></span>
      <span class="text-xs font-semibold" [class]="textColorClass()">
        {{ status() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngStatusBadgeComponent {
  status = input.required<RoomStatus>();

  private readonly style = computed(() => STATUS_STYLES[this.status()]);

  protected containerClasses = computed(
    () => `flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0 ${this.style().container}`,
  );

  protected dotClasses = computed(() => `w-1.5 h-1.5 rounded-full ${this.style().dot}`);

  protected textColorClass = computed(() => this.style().text);
}
