import {
  Component,
  inject,
  signal,
  computed,
  output,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelsService } from '../../services/channels.service';
import { Channel, CountryItem } from '../../models/channel.model';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css'],
})
export class ChannelListComponent implements OnInit {
  // ─── Dependencias ──────────────────────────────────────────────────────────
  readonly channelsSvc = inject(ChannelsService);

  // ─── Eventos de salida ─────────────────────────────────────────────────────
  readonly channelSelected = output<Channel>();

  // ─── Estado local (Signals) ────────────────────────────────────────────────
  readonly searchTerm      = signal<string>('');
  readonly activeChannel   = signal<Channel | null>(null);
  readonly selectedGroup   = signal<string>('');
  readonly selectedCountry = signal<string>('mx');
  readonly countries       = signal<CountryItem[]>([]);

  // ─── Computed: canales filtrados por búsqueda y grupo ─────────────────────
  readonly filteredChannels = computed(() => {
    const term    = this.searchTerm().toLowerCase().trim();
    const group   = this.selectedGroup();
    const all     = this.channelsSvc.channels();

    return all.filter((ch) => {
      const matchesSearch =
        !term ||
        ch.name.toLowerCase().includes(term) ||
        ch.group.toLowerCase().includes(term);
      const matchesGroup = !group || ch.group === group;
      return matchesSearch && matchesGroup;
    });
  });

  // ─── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.channelsSvc.getCountries().subscribe({
      next: (res) => this.countries.set(res.countries),
      error: () => this.countries.set([]),
    });
    this.channelsSvc.loadChannels(this.selectedCountry());
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  onSelectChannel(channel: Channel): void {
    this.activeChannel.set(channel);
    this.channelSelected.emit(channel);
  }

  onCountryChange(code: string): void {
    this.selectedCountry.set(code);
    this.selectedGroup.set('');
    this.searchTerm.set('');
    this.channelsSvc.loadChannels(code);
  }

  onGroupChange(group: string): void {
    this.selectedGroup.set(group);
    this.searchTerm.set('');
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  getFallbackText(name: string): string {
    return name?.charAt(0)?.toUpperCase() || '?';
  }
}
