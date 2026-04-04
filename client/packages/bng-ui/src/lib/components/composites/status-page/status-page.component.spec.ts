import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BngStatusPageComponent } from './status-page.component';
import { bngIconAlertTriangle } from '../../../icons/icons';

@Component({
  standalone: true,
  imports: [BngStatusPageComponent],
  template: `
    <bng-status-page
      [icon]="icon()"
      [iconColor]="iconColor()"
      [title]="title()"
      [description]="description()"
    >
      <button class="test-action">Action</button>
    </bng-status-page>
  `,
})
class TestHost {
  icon = signal(bngIconAlertTriangle);
  iconColor = signal('text-text-secondary');
  title = signal('Something went wrong');
  description = signal<string | undefined>(undefined);
}

describe('BngStatusPageComponent', () => {
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

  it('should render title text', () => {
    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
  });

  it('should render description when provided', () => {
    host.description.set('Please try again later.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Please try again later.');
  });

  it('should omit description <p> when not provided', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('bng-status-page p');
    expect(paragraphs.length).toBe(0);
  });

  it('should render projected action content', () => {
    const action = fixture.nativeElement.querySelector('.test-action');
    expect(action).toBeTruthy();
    expect(action.textContent).toContain('Action');
  });

  it('should render icon SVG at 48x48', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('should apply default iconColor class to icon wrapper', () => {
    const iconWrapper = fixture.nativeElement.querySelector('svg').parentElement;
    expect(iconWrapper.classList).toContain('text-text-secondary');
  });

  it('should apply custom iconColor when set', () => {
    host.iconColor.set('text-error');
    fixture.detectChanges();
    const iconWrapper = fixture.nativeElement.querySelector('svg').parentElement;
    expect(iconWrapper.classList).toContain('text-error');
    expect(iconWrapper.classList).not.toContain('text-text-secondary');
  });

  it('should use <h1> for the title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1.textContent.trim()).toBe('Something went wrong');
  });

  it('should render icon SVG content', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.innerHTML).toBeTruthy();
    expect(svg.innerHTML.length).toBeGreaterThan(0);
  });

  it('should have flex: 1 on host element for filling available space', () => {
    const host = fixture.nativeElement.querySelector('bng-status-page');
    expect(host.style.flex).toContain('1');
  });
});
