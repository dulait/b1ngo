import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Room implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly roomId = signal('');

  ngOnInit(): void {
    this.roomId.set(this.route.snapshot.params['roomId']);
  }
}
