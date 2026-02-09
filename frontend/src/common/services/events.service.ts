import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '@/environments/environment';
import { Event } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class EventsService implements OnDestroy {
  private http = inject(HttpClient);
  private socket: Socket;

  private events$ = new BehaviorSubject<Event[]>([]);
  public latestEvents$ = this.events$.asObservable().pipe(shareReplay(1));

  public liveUsersCount$ = this.events$.pipe(
    map((events) => {
      const userStatus = new Map<string, string>();
      events.forEach((e) => {
        if (!userStatus.has(e.user.id)) {
          userStatus.set(e.user.id, e.type);
        }
      });
      return Array.from(userStatus.values()).filter((s) => s === 'entry').length;
    }),
    shareReplay(1),
  );

  constructor() {
    this.socket = io(environment.socketUrl, { transports: ['websocket'] });

    this.setupWebsocket();
    this.loadHistory();
  }

  private setupWebsocket(): void {
    this.socket.on('onNewEvent', (newEvent: Event) => {
      const current = this.events$.value;
      this.events$.next([newEvent, ...current]);
    });

    this.socket.on('connect', () => console.log('WebSocket Connected'));
    this.socket.on('disconnect', () => console.log('WebSocket Disconnected'));
  }

  private loadHistory(): void {
    this.http.get<Event[]>(`${environment.apiUrl}/events`).subscribe({
      next: (history) => {
        const current = this.events$.value;
        const combined = [...current, ...history];

        // remove duplicates
        const unique = Array.from(new Map(combined.map((e) => [e.id, e])).values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        this.events$.next(unique);
      },
      error: (err) => console.error('Error loading history', err),
    });
  }

  public ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
