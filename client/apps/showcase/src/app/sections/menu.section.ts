import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  BngMenuComponent,
  BngMenuItemComponent,
  BngIconButtonComponent,
  BngCardComponent,
  bngIconKebab,
  bngIconUser,
  bngIconPencil,
  bngIconSignOut,
} from 'bng-ui';

@Component({
  selector: 'ds-menu',
  standalone: true,
  imports: [BngMenuComponent, BngMenuItemComponent, BngIconButtonComponent, BngCardComponent],
  host: { style: 'display: block' },
  template: `
    <h2 class="text-[1.5rem] font-bold text-text-primary mb-2">Menu</h2>
    <p class="text-sm text-text-secondary mb-6">
      Dropdown menu triggered by an icon button, with icon + label menu items.
    </p>

    <div class="space-y-6">
      <bng-card header="Basic menu">
        <div class="relative inline-block">
          <bng-icon-button
            [icon]="kebabIcon"
            ariaLabel="Open menu"
            (click)="menuOpen.set(!menuOpen())"
          />
          <bng-menu [open]="menuOpen()" (closed)="menuOpen.set(false)">
            <bng-menu-item [icon]="userIcon" label="Profile" (clicked)="noop()" />
            <bng-menu-item [icon]="pencilIcon" label="Edit" (clicked)="noop()" />
            <bng-menu-item [icon]="signOutIcon" label="Sign Out" (clicked)="noop()" />
          </bng-menu>
        </div>
      </bng-card>

      <bng-card header="With footer">
        <div class="relative inline-block">
          <bng-icon-button
            [icon]="kebabIcon"
            ariaLabel="Open menu"
            (click)="footerMenuOpen.set(!footerMenuOpen())"
          />
          <bng-menu
            [open]="footerMenuOpen()"
            footer="v0.1.0"
            copyright="B1NGO"
            (closed)="footerMenuOpen.set(false)"
          >
            <bng-menu-item [icon]="userIcon" label="Profile" (clicked)="noop()" />
            <bng-menu-item [icon]="signOutIcon" label="Sign Out" (clicked)="noop()" />
          </bng-menu>
        </div>
      </bng-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSection {
  protected readonly kebabIcon = bngIconKebab;
  protected readonly userIcon = bngIconUser;
  protected readonly pencilIcon = bngIconPencil;
  protected readonly signOutIcon = bngIconSignOut;

  readonly menuOpen = signal(false);
  readonly footerMenuOpen = signal(false);

  noop(): void {}
}
