import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BngToastContainerComponent } from './toast.component';
import { ToastService } from '../../../services/toast.service';

describe('BngToastContainerComponent', () => {
  let fixture: ComponentFixture<BngToastContainerComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BngToastContainerComponent],
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(BngToastContainerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show toast when service emits', () => {
    toastService.show('Test message', 'info', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test message');
  });

  it('should show multiple toasts', () => {
    toastService.show('Toast 1', 'info', 0);
    toastService.show('Toast 2', 'success', 0);
    fixture.detectChanges();
    const alerts = fixture.nativeElement.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBe(2);
  });

  it('should limit to 3 visible toasts', () => {
    toastService.show('Toast 1', 'info', 0);
    toastService.show('Toast 2', 'info', 0);
    toastService.show('Toast 3', 'info', 0);
    toastService.show('Toast 4', 'info', 0);
    fixture.detectChanges();
    const alerts = fixture.nativeElement.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBe(3);
  });

  it('should dismiss toast after exit animation', () => {
    vi.useFakeTimers();
    const id = toastService.show('Dismissable', 'info', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dismissable');

    toastService.dismiss(id);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dismissable');

    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Dismissable');
    vi.useRealTimers();
  });

  it('should render dismiss button with aria-label', () => {
    toastService.show('Test', 'info', 0);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[aria-label="Dismiss notification"]');
    expect(btn).toBeTruthy();
  });

  it('should position container at top of viewport', () => {
    const container = fixture.nativeElement.querySelector('.fixed');
    expect(container.classList.contains('top-4')).toBe(true);
    expect(container.classList.contains('bottom-4')).toBe(false);
  });
});

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should add toast', () => {
    service.show('Test');
    expect(service.toasts().length).toBe(1);
  });

  it('should provide convenience methods', () => {
    service.info('Info', 0);
    service.success('Success', 0);
    service.warning('Warning', 0);
    expect(service.toasts().length).toBe(3);
    service.error('Error', 0);
    expect(service.toasts().length).toBe(3);
  });

  it('should mark toast as dismissing on dismiss', () => {
    const id = service.show('Test', 'info', 0);
    service.dismiss(id);
    expect(service.toasts()[0].dismissing).toBe(true);
  });

  it('should remove toast after exit animation delay', () => {
    vi.useFakeTimers();
    const id = service.show('Test', 'info', 0);
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(200);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should clear all toasts', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    service.clear();
    expect(service.toasts().length).toBe(0);
  });
});
