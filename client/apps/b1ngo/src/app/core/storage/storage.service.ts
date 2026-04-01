import { Injectable } from '@angular/core';
import { SessionInfo } from '../auth/session-info.interface';

interface StorageKeyMap {
  'bng-session': SessionInfo;
  'bng-tutorial-completed': string;
  'bng-rejoin-dismissed': string;
}

type StorageBackend = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<K extends keyof StorageKeyMap>(key: K, backend: StorageBackend = 'local'): StorageKeyMap[K] | null {
    const raw = this.store(backend).getItem(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as StorageKeyMap[K];
    } catch {
      return null;
    }
  }

  getString<K extends keyof StorageKeyMap>(key: K, backend: StorageBackend = 'local'): string | null {
    return this.store(backend).getItem(key);
  }

  set<K extends keyof StorageKeyMap>(key: K, value: StorageKeyMap[K], backend: StorageBackend = 'local'): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.store(backend).setItem(key, serialized);
  }

  remove<K extends keyof StorageKeyMap>(key: K, backend: StorageBackend = 'local'): void {
    this.store(backend).removeItem(key);
  }

  private store(backend: StorageBackend): Storage {
    return backend === 'local' ? localStorage : sessionStorage;
  }
}
