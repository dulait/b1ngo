import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngMenuItemComponent } from './menu-item.component';

@Component({
  standalone: true,
  imports: [BngMenuItemComponent],
  template: `
    <bng-menu-item [icon]="icon()" label="Test Item" (clicked)="onClicked()">
      <span menuItemIcon class="custom-icon">C</span>
    </bng-menu-item>
  `,
})
class TestHost {
  icon = signal<string | null>('<circle cx="12" cy="12" r="1"/>');
  onClicked = vi.fn();
}

describe('BngMenuItemComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render label', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Item');
  });

  it('should render icon when provided', () => {
    const icon = fixture.nativeElement.querySelector('bng-icon');
    expect(icon).toBeTruthy();
  });

  it('should render custom content when icon is null', () => {
    host.icon.set(null);
    fixture.detectChanges();
    const customIcon = fixture.nativeElement.querySelector('.custom-icon');
    expect(customIcon).toBeTruthy();
    const bngIcon = fixture.nativeElement.querySelector('bng-icon');
    expect(bngIcon).toBeFalsy();
  });

  it('should emit clicked on click', () => {
    const button = fixture.nativeElement.querySelector('[role="menuitem"]');
    button.click();
    expect(host.onClicked).toHaveBeenCalled();
  });

  it('should have menuitem role', () => {
    const button = fixture.nativeElement.querySelector('[role="menuitem"]');
    expect(button).toBeTruthy();
  });
});
