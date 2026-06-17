import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Channel,
  ChannelsApiResponse,
  CountriesApiResponse,
} from '../models/channel.model';

@Injectable({ providedIn: 'root' })
export class ChannelsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api';

  // ─── Estado reactivo del servicio (Signals) ────────────────────────────────

  readonly channels = signal<Channel[]>([]);
  readonly groups   = signal<string[]>([]);
  readonly loading  = signal<boolean>(false);
  readonly error    = signal<string | null>(null);
  readonly currentCountry = signal<string>('mx');

  // ─── Computed: canales agrupados por categoría ─────────────────────────────

  readonly channelsByGroup = computed(() => {
    const map = new Map<string, Channel[]>();
    for (const ch of this.channels()) {
      const arr = map.get(ch.group) ?? [];
      arr.push(ch);
      map.set(ch.group, arr);
    }
    return map;
  });

  // ─── HTTP Methods ──────────────────────────────────────────────────────────

  /**
   * Carga los canales de un país y actualiza los signals de estado.
   */
  loadChannels(country: string, group?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.currentCountry.set(country);

    let params = new HttpParams().set('limit', '500');
    if (group) {
      params = params.set('group', group);
    }

    this.http
      .get<ChannelsApiResponse>(`${this.apiBase}/channels/${country}`, { params })
      .pipe(
        catchError((err) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            'Error al cargar los canales. Intenta de nuevo.';
          this.error.set(msg);
          this.loading.set(false);
          return throwError(() => new Error(msg));
        })
      )
      .subscribe((response) => {
        this.channels.set(response.channels ?? []);
        this.groups.set(response.groups ?? []);
        this.loading.set(false);
      });
  }

  /**
   * Devuelve un Observable con la lista de países disponibles.
   */
  getCountries(): Observable<CountriesApiResponse> {
    return this.http
      .get<CountriesApiResponse>(`${this.apiBase}/countries`)
      .pipe(
        catchError((err) => {
          return throwError(
            () => new Error(err?.error?.message || 'No se pudo cargar la lista de países.')
          );
        })
      );
  }
}
