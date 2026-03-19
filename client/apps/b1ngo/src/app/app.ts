import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BngToastContainerComponent, ThemeService } from 'bng-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BngToastContainerComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initialize();
  }
}
