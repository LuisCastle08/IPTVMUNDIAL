import {
  Component,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Channel } from './models/channel.model';
import { PlayerComponent } from './components/player/player.component';
import { ChannelListComponent } from './components/channel-list/channel-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PlayerComponent, ChannelListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly activeChannel = signal<Channel | null>(null);
  readonly sidebarOpen   = signal<boolean>(true);

  onChannelSelected(channel: Channel): void {
    this.activeChannel.set(channel);
    // En móvil, cerrar la barra lateral automáticamente al seleccionar
    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
