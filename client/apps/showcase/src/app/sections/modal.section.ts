import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BngModalComponent, BngButtonComponent, BngCardComponent } from 'bng-ui';

@Component({
  selector: 'ds-modal-section',
  standalone: true,
  imports: [BngModalComponent, BngButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Modal</h2>
    <p class="text-sm text-text-secondary mb-6">
      Generic centered modal overlay with backdrop, focus trap, and scroll lock.
      Closes on backdrop click or Escape key.
    </p>

    <div class="space-y-6">
      <bng-card header="Basic Modal">
        <bng-button variant="primary" (clicked)="basicOpen.set(true)">Open Modal</bng-button>
        <bng-modal [open]="basicOpen()" (closed)="basicOpen.set(false)">
          <div class="p-6">
            <h3 id="basic-modal-title" class="text-lg font-semibold text-text-primary mb-3">
              Basic Modal
            </h3>
            <p class="text-sm text-text-secondary mb-4">
              This is a simple modal with projected content. Click the backdrop or press Escape to
              close.
            </p>
            <bng-button variant="primary" (clicked)="basicOpen.set(false)">Close</bng-button>
          </div>
        </bng-modal>
      </bng-card>

      <bng-card header="Max Width Variants">
        <div class="flex flex-wrap gap-3">
          @for (size of sizes; track size) {
            <bng-button variant="secondary" (clicked)="openSize(size)">
              {{ size }} ({{ sizeLabels[size] }})
            </bng-button>
          }
        </div>

        @for (size of sizes; track size) {
          <bng-modal
            [open]="sizeOpen() === size"
            [maxWidth]="size"
            (closed)="sizeOpen.set(null)"
          >
            <div class="p-6">
              <h3 class="text-lg font-semibold text-text-primary mb-3">
                {{ size }} modal ({{ sizeLabels[size] }})
              </h3>
              <p class="text-sm text-text-secondary mb-4">
                This modal uses maxWidth="{{ size }}".
              </p>
              <bng-button variant="primary" (clicked)="sizeOpen.set(null)">Close</bng-button>
            </div>
          </bng-modal>
        }
      </bng-card>

      <bng-card header="Scrollable Content">
        <bng-button variant="secondary" (clicked)="scrollOpen.set(true)">
          Open Scrollable Modal
        </bng-button>
        <bng-modal [open]="scrollOpen()" (closed)="scrollOpen.set(false)">
          <div modal-header class="px-6 pt-6 pb-3 border-b border-border-subtle">
            <h3 class="text-lg font-semibold text-text-primary">Scrollable Content</h3>
            <p class="text-xs text-text-secondary mt-1">Header stays fixed, only the body scrolls</p>
          </div>
          <div class="px-6 py-4">
            @for (i of paragraphs; track i) {
              <p class="text-sm text-text-secondary mb-4">
                Paragraph {{ i + 1 }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
              </p>
            }
          </div>
          <div modal-footer class="px-6 py-4 border-t border-border-subtle">
            <bng-button variant="primary" (clicked)="scrollOpen.set(false)">Close</bng-button>
          </div>
        </bng-modal>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalSection {
  readonly basicOpen = signal(false);
  readonly sizeOpen = signal<'sm' | 'md' | 'lg' | null>(null);
  readonly scrollOpen = signal(false);

  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly sizeLabels: Record<string, string> = {
    sm: '384px',
    md: '448px',
    lg: '512px',
  };
  readonly paragraphs = Array.from({ length: 10 }, (_, i) => i);

  openSize(size: 'sm' | 'md' | 'lg'): void {
    this.sizeOpen.set(size);
  }
}
