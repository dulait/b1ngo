import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { BngSelectComponent } from './select.component';

const TEST_OPTIONS = [
  { value: 'bahrain', label: 'Bahrain Grand Prix' },
  { value: 'saudi', label: 'Saudi Arabian Grand Prix' },
  { value: 'australia', label: 'Australian Grand Prix' },
  { value: 'japan', label: 'Japanese Grand Prix' },
];

describe('BngSelectComponent', () => {
  let component: BngSelectComponent;
  let fixture: ComponentFixture<BngSelectComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BngSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Grand Prix');
    fixture.componentRef.setInput('options', TEST_OPTIONS);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  function getTrigger(): HTMLButtonElement {
    return el.querySelector('[role="combobox"]')!;
  }

  function getListbox(): HTMLElement | null {
    return el.querySelector('[role="listbox"]');
  }

  function getOptions(): HTMLElement[] {
    return Array.from(el.querySelectorAll('[role="option"]'));
  }

  function openDropdown(): void {
    getTrigger().click();
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const label = el.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Grand Prix');
  });

  it('should render trigger with placeholder when no value', () => {
    const trigger = getTrigger();
    expect(trigger.textContent).toContain('Select...');
  });

  it('should render trigger with selected label when value set', () => {
    fixture.componentRef.setInput('value', 'bahrain');
    fixture.detectChanges();
    const trigger = getTrigger();
    expect(trigger.textContent).toContain('Bahrain Grand Prix');
  });

  it('should open dropdown on click', () => {
    expect(getListbox()).toBeNull();
    openDropdown();
    expect(getListbox()).toBeTruthy();
    expect(getOptions().length).toBe(TEST_OPTIONS.length);
  });

  it('should close dropdown on second click', () => {
    openDropdown();
    expect(getListbox()).toBeTruthy();
    getTrigger().click();
    fixture.detectChanges();
    expect(getListbox()).toBeNull();
  });

  it('should emit valueChange on option click', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    openDropdown();
    getOptions()[2].click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('australia');
    expect(getListbox()).toBeNull();
  });

  it('should open with ArrowDown', () => {
    getTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(getListbox()).toBeTruthy();
  });

  it('should navigate with ArrowDown/ArrowUp', () => {
    fixture.componentRef.setInput('value', 'bahrain');
    fixture.detectChanges();
    openDropdown();

    const trigger = getTrigger();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-1');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-0');
  });

  it('should select with Enter', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);
    openDropdown();

    const trigger = getTrigger();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(getListbox()).toBeNull();
  });

  it('should close with Escape', () => {
    openDropdown();
    expect(getListbox()).toBeTruthy();
    getTrigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(getListbox()).toBeNull();
  });

  it('should type-ahead highlight matching option', () => {
    openDropdown();
    const trigger = getTrigger();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true }));
    fixture.detectChanges();
    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(activeId).toContain('-3'); // Japanese is index 3
  });

  describe('ARIA attributes', () => {
    it('should have combobox role on trigger', () => {
      expect(getTrigger().getAttribute('role')).toBe('combobox');
    });

    it('should have aria-haspopup listbox', () => {
      expect(getTrigger().getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should have aria-expanded false when closed', () => {
      expect(getTrigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('should have aria-expanded true when open', () => {
      openDropdown();
      expect(getTrigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('should have listbox role on dropdown', () => {
      openDropdown();
      expect(getListbox()?.getAttribute('role')).toBe('listbox');
    });

    it('should have option role and aria-selected on options', () => {
      fixture.componentRef.setInput('value', 'bahrain');
      fixture.detectChanges();
      openDropdown();
      const opts = getOptions();
      expect(opts[0].getAttribute('role')).toBe('option');
      expect(opts[0].getAttribute('aria-selected')).toBe('true');
      expect(opts[1].getAttribute('aria-selected')).toBe('false');
    });
  });

  it('should not open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    getTrigger().click();
    fixture.detectChanges();
    expect(getListbox()).toBeNull();
  });

  it('should show error message and aria-invalid', () => {
    fixture.componentRef.setInput('error', 'Selection required');
    fixture.detectChanges();
    const errorEl = el.querySelector('.text-error');
    expect(errorEl?.textContent?.trim()).toBe('Selection required');
    expect(getTrigger().getAttribute('aria-invalid')).toBe('true');
  });

  it('should show hint message', () => {
    fixture.componentRef.setInput('hint', 'Pick a race');
    fixture.detectChanges();
    const hintEl = el.querySelector('.text-text-secondary:not(label)');
    expect(hintEl?.textContent?.trim()).toBe('Pick a race');
  });
});
