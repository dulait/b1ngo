import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngMenuComponent } from './menu.component';

@Component({
  standalone: true,
  imports: [BngMenuComponent],
  template: `
    <bng-menu [open]="open()" [footer]="footer()" (closed)="onClosed()">
      <div class="test-content">Menu content</div>
    </bng-menu>
  `,
})
class TestHost {
  open = signal(false);
  footer = signal<string | null>(null);
  onClosed = vi.fn();
}

describe('BngMenuComponent', () => {
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

  it('should not render menu when closed', () => {
    const menu = fixture.nativeElement.querySelector('[role="menu"]');
    expect(menu).toBeFalsy();
  });

  it('should render menu when open', () => {
    host.open.set(true);
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
  });

  it('should project content', () => {
    host.open.set(true);
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.test-content');
    expect(content).toBeTruthy();
    expect(content.textContent).toContain('Menu content');
  });

  it('should render footer when provided', () => {
    host.open.set(true);
    host.footer.set('v0.1.0');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('v0.1.0');
  });

  it('should not render footer when null', () => {
    host.open.set(true);
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.border-t');
    expect(footer).toBeFalsy();
  });

  it('should emit closed on backdrop click', () => {
    host.open.set(true);
    fixture.detectChanges();
    const backdrop = fixture.nativeElement.querySelector('.fixed.inset-0');
    backdrop.click();
    expect(host.onClosed).toHaveBeenCalled();
  });

  it('should emit closed on Escape key', () => {
    host.open.set(true);
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector('[role="menu"]');
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.onClosed).toHaveBeenCalled();
  });
});
