import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SyncMessage {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'QUERY';
  table: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private channel: BroadcastChannel;
  private syncSubject = new BehaviorSubject<SyncMessage | null>(null);

  constructor() {
    this.channel = new BroadcastChannel('medblock-sync');
    this.channel.onmessage = (event) => {
      this.syncSubject.next(event.data);
    };
  }

  broadcast(message: SyncMessage): void {
    this.channel.postMessage(message);
  }

  getSyncMessages(): Observable<SyncMessage | null> {
    return this.syncSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.channel.close();
  }
} 