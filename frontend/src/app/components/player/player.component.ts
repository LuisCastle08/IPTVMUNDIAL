import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class PlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() streamUrl: string | null = null;
  @Input() channelName = '';
  @Input() channelLogo = '';

  @ViewChild('videoEl', { static: false })
  videoRef!: ElementRef<HTMLVideoElement>;

  readonly playerError = signal<string | null>(null);
  readonly isLoading   = signal<boolean>(false);

  private hls: Hls | null = null;

  // ─── Ciclo de vida ─────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    if (this.streamUrl) {
      this.initPlayer(this.streamUrl);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Solo reaccionar al cambio de streamUrl una vez que la vista esté lista
    if (changes['streamUrl'] && !changes['streamUrl'].isFirstChange()) {
      const url = changes['streamUrl'].currentValue as string | null;
      if (url) {
        this.initPlayer(url);
      } else {
        this.destroyHls();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyHls();
  }

  // ─── HLS Lifecycle ─────────────────────────────────────────────────────────

  private initPlayer(url: string): void {
    this.playerError.set(null);
    this.isLoading.set(true);
    this.destroyHls();

    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        startLevel: -1,        // Auto quality
        debug: false,
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.isLoading.set(false);
        video.play().catch(() => {
          // El navegador bloqueó autoplay; el usuario debe presionar play
        });
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.isLoading.set(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.playerError.set(
                'Error de red: no se puede alcanzar el stream. Verifica tu conexión o intenta con otro canal.'
              );
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.playerError.set(
                'Error de decodificación de video. El stream puede estar temporalmente no disponible.'
              );
              this.hls?.recoverMediaError();
              break;
            default:
              this.playerError.set(
                'Error desconocido al reproducir el canal. Intenta seleccionar otro.'
              );
              this.destroyHls();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari nativo soporta HLS directamente
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        this.isLoading.set(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        this.isLoading.set(false);
        this.playerError.set('Error al cargar el stream en este navegador.');
      });
    } else {
      this.isLoading.set(false);
      this.playerError.set('Tu navegador no soporta reproducción HLS.');
    }
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }

  retryPlayback(): void {
    if (this.streamUrl) {
      this.initPlayer(this.streamUrl);
    }
  }
}
