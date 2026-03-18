import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  BngBottomSheetComponent,
  BngButtonComponent,
  BngInputComponent,
  BngCardComponent,
} from 'bng-ui';

@Component({
  selector: 'ds-bottom-sheet-section',
  standalone: true,
  imports: [BngBottomSheetComponent, BngButtonComponent, BngInputComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Bottom Sheet</h2>
    <p class="text-sm text-text-secondary mb-6">
      Modal bottom sheet with swipe-to-dismiss. Contains an input and save button.
    </p>

    <bng-card header="Open Sheet">
      <bng-button variant="primary" (clicked)="sheetOpen.set(true)">Open Bottom Sheet</bng-button>
    </bng-card>

    <bng-bottom-sheet title="Edit Square" [open]="sheetOpen()" (closed)="sheetOpen.set(false)">
      <div class="space-y-4">
        <bng-input label="Square Text" placeholder="e.g. Safety Car deployed" />
        <bng-button variant="primary" [fullWidth]="true" (clicked)="sheetOpen.set(false)"
          >Save</bng-button
        >
      </div>
    </bng-bottom-sheet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetSection {
  readonly sheetOpen = signal(false);
}
