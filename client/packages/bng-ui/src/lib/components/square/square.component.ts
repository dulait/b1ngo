import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { BngIconComponent } from '../../icons/icon.component';
import { bngIconPencil } from '../../icons/icons';

const LONG_PRESS_HINT_DELAY_MS = 300;
const LONG_PRESS_THRESHOLD_MS = 500;
const HAPTIC_DURATION_MS = 10;
const SMALL_TEXT_SIZE_THRESHOLD = 7;

@Component({
  selector: 'bng-square',
  standalone: true,
  imports: [BngIconComponent],
  template: `
    <div
      #squareEl
      [class]="containerClasses()"
      [attr.role]="'gridcell'"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-selected]="isMarked() || undefined"
      [attr.tabindex]="isInteractive() ? 0 : -1"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick(); $event.preventDefault()"
      (keydown.i)="onInspectKey()"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp()"
      (pointerleave)="onPointerUp()"
    >
      <span [class]="textClasses()">{{ displayText() }}</span>

      @if (isMarked() && markedByLabel()) {
        <span [class]="labelClasses()">{{ markedByLabel() }}</span>
      }

      @if (isEditable() && !isMarked() && !isFreeSpace()) {
        <span class="absolute bottom-0.5 right-0.5 text-text-secondary">
          <bng-icon [icon]="pencilIcon" size="xs" />
        </span>
      }
    </div>
  `,
  host: {
    style: 'display: block; aspect-ratio: 1; min-width: 0;',
  },
  styles: `
    .square-text-clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BngSquareComponent {
  displayText = input('');
  isFreeSpace = input(false);
  isMarked = input(false);
  markedByLabel = input<string | null>(null);
  markedByVariant = input<'self' | 'other' | null>(null);
  isEditable = input(false);
  isMarkable = input(false);
  isWinning = input(false);
  matrixSize = input(5);

  mark = output<void>();
  unmark = output<void>();
  edit = output<void>();
  inspect = output<HTMLElement>();

  protected readonly squareEl = viewChild<ElementRef<HTMLElement>>('squareEl');
  protected readonly pencilIcon = bngIconPencil;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private hintTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressTriggered = false;
  private readonly pressing = signal(false);

  protected isInteractive = computed(() => true);

  protected ariaLabel = computed(() => {
    const text = this.displayText();
    if (this.isFreeSpace()) {
      return `${text}, free space`;
    }
    if (!this.isMarked()) {
      return `${text}, unmarked`;
    }
    const label = this.markedByLabel();
    return `${text}, marked by ${label}`;
  });

  protected containerClasses = computed(() => {
    const base =
      'rounded flex items-center justify-center relative transition-all duration-150 h-full select-none';

    if (this.isFreeSpace()) {
      const border = this.isWinning() ? 'border-2 border-success' : 'border border-border-subtle';
      return `${base} bg-bg-surface-elevated ${border} p-1.5 opacity-40`;
    }

    if (this.isMarked()) {
      const border = this.isWinning() ? 'border-2 border-success' : 'border border-accent';
      const press = this.pressing() ? 'opacity-80' : '';
      return `${base} bg-accent-muted ${border} pt-1.5 px-1.5 pb-4 cursor-pointer ${press}`;
    }

    if (this.isEditable()) {
      return `${base} bg-bg-surface border border-dashed border-border-default p-1.5 cursor-pointer`;
    }

    if (this.isMarkable()) {
      return `${base} bg-bg-surface border border-border-default p-1.5 cursor-pointer hover:bg-bg-surface-hover`;
    }

    return `${base} bg-bg-surface border border-border-default p-1.5`;
  });

  protected textClasses = computed(() => {
    const sizeClass = this.matrixSize() >= SMALL_TEXT_SIZE_THRESHOLD ? 'text-[9px]' : 'text-[11px]';
    const color = this.isFreeSpace() ? 'text-text-disabled' : 'text-text-primary';
    return `${sizeClass} font-medium leading-tight text-center square-text-clamp ${color}`;
  });

  protected labelClasses = computed(() => {
    const color = this.markedByVariant() === 'self' ? 'text-accent' : 'text-text-secondary';
    return `absolute bottom-1 text-[9px] font-medium leading-none ${color}`;
  });

  /** Tap: toggle mark/unmark, or edit in lobby */
  protected onClick(): void {
    if (this.longPressTriggered) {
      return;
    }
    if (this.isFreeSpace()) {
      return;
    }

    if (this.isEditable() && !this.isMarked()) {
      this.edit.emit();
    } else if (this.isMarked()) {
      this.unmark.emit();
    } else if (this.isMarkable()) {
      this.mark.emit();
    }
  }

  /** Long-press: inspect popover (works on any square, any mode) */
  protected onPointerDown(_event: PointerEvent): void {
    this.longPressTriggered = false;

    this.hintTimer = setTimeout(() => {
      this.pressing.set(true);
    }, LONG_PRESS_HINT_DELAY_MS);

    this.longPressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.pressing.set(false);
      if (navigator?.userActivation?.hasBeenActive) {
        navigator.vibrate?.(HAPTIC_DURATION_MS);
      }
      const el = this.squareEl()?.nativeElement;
      if (el) {
        this.inspect.emit(el);
      }
    }, LONG_PRESS_THRESHOLD_MS);
  }

  protected onPointerUp(): void {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer);
      this.hintTimer = null;
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.pressing.set(false);
  }

  protected onInspectKey(): void {
    const el = this.squareEl()?.nativeElement;
    if (el) {
      this.inspect.emit(el);
    }
  }
}
