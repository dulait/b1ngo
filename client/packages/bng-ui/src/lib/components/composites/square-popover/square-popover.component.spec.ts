import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BngSquarePopoverComponent } from './square-popover.component';

describe('BngSquarePopoverComponent', () => {
  let fixture: ComponentFixture<BngSquarePopoverComponent>;
  let component: BngSquarePopoverComponent;
  let anchorEl: HTMLElement;

  beforeEach(async () => {
    anchorEl = document.createElement('div');
    anchorEl.style.position = 'fixed';
    anchorEl.style.top = '200px';
    anchorEl.style.left = '100px';
    anchorEl.style.width = '60px';
    anchorEl.style.height = '60px';
    document.body.appendChild(anchorEl);

    await TestBed.configureTestingModule({
      imports: [BngSquarePopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngSquarePopoverComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('displayText', 'Safety Car deployed');
    fixture.componentRef.setInput('isFreeSpace', false);
    fixture.componentRef.setInput('isMarked', false);
    fixture.componentRef.setInput('markedByLabel', null);
    fixture.componentRef.setInput('markedAt', null);
    fixture.componentRef.setInput('anchorElement', anchorEl);
    fixture.detectChanges();
  });

  afterEach(() => {
    anchorEl.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role tooltip', () => {
    const el = fixture.nativeElement.querySelector('[role="tooltip"]');
    expect(el).toBeTruthy();
  });

  it('should display full text for unmarked square', () => {
    expect(fixture.nativeElement.textContent).toContain('Safety Car deployed');
  });

  it('should not show marked-by section for unmarked square', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Marked by');
  });

  it('should show marked-by section for marked square', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedByLabel', 'You');
    fixture.componentRef.setInput('markedAt', new Date().toISOString());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Marked by You');
    expect(fixture.nativeElement.textContent).toContain('Just now');
  });

  it('should show "Free Space" for free space', () => {
    fixture.componentRef.setInput('isFreeSpace', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Free Space');
  });

  it('should emit closed', () => {
    const spy = vi.fn();
    component.closed.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should show Host label for host-marked', () => {
    fixture.componentRef.setInput('isMarked', true);
    fixture.componentRef.setInput('markedByLabel', 'Host');
    fixture.componentRef.setInput('markedAt', new Date(Date.now() - 120000).toISOString());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Marked by Host');
    expect(fixture.nativeElement.textContent).toContain('2m ago');
  });

  it('should apply shadow-lg class', () => {
    const el = fixture.nativeElement.querySelector('[role="tooltip"]');
    expect(el.className).toContain('shadow-lg');
  });
});
