import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'learn.sessionId';

@Injectable({ providedIn: 'root' })
export class LearnSessionService {
  private readonly id = signal(this.ensureId());

  sessionId(): string {
    return this.id();
  }

  private ensureId(): string {
    if (typeof localStorage === 'undefined') return crypto.randomUUID();
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing && this.isUuid(existing)) return existing;
      const created = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, created);
      return created;
    } catch {
      return crypto.randomUUID();
    }
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
