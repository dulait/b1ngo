import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BngHeaderComponent } from 'bng-ui';
import { RoomApiService } from '../../core/api/room-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { safeAsync } from '../../core/api/safe-async';
import { CreateRoomForm } from './create-room-form/create-room-form';
import { JoinRoomForm } from './join-room-form/join-room-form';
import { Tutorial } from '../tutorial/tutorial';

@Component({
  selector: 'app-home',
  imports: [CreateRoomForm, JoinRoomForm, BngHeaderComponent, Tutorial],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly roomApi = inject(RoomApiService);
  private readonly auth = inject(AuthService);

  readonly tutorialOpen = signal(false);

  async ngOnInit(): Promise<void> {
    if (!localStorage.getItem('bng-tutorial-completed')) {
      this.tutorialOpen.set(true);
    }

    if (!this.auth.hasSession()) {
      return;
    }

    const result = await safeAsync(this.roomApi.reconnect());
    if (result.ok) {
      this.auth.saveSession(result.value.roomId, result.value.playerId, this.auth.getPlayerToken());
      this.router.navigate(['/room', result.value.roomId]);
    } else {
      this.auth.clearSession();
    }
  }

  onRoomCreated(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.auth.saveSession(event.roomId, event.playerId, event.playerToken);
    this.router.navigate(['/room', event.roomId]);
  }

  onRoomJoined(event: { roomId: string; playerId: string; playerToken: string }): void {
    this.auth.saveSession(event.roomId, event.playerId, event.playerToken);
    this.router.navigate(['/room', event.roomId]);
  }

  openTutorial(): void {
    this.tutorialOpen.set(true);
  }

  closeTutorial(): void {
    this.tutorialOpen.set(false);
    localStorage.setItem('bng-tutorial-completed', 'true');
  }
}
