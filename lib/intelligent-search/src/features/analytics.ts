export type AnalyticsEventType = 'search' | 'select' | 'hover' | 'impression';

export interface SearchAnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  query: string;
  toolId?: string;
  timestamp: number;
  resultCount: number;
  latencyMs: number;
}

export interface SearchHistoryItem {
  query: string;
  toolId: string;
  timestamp: number;
}

export class SearchAnalytics {
  private events: SearchAnalyticsEvent[] = [];
  private history: SearchHistoryItem[] = [];
  private readonly maxHistorySize = 100;
  private readonly maxEventsSize = 500;

  trackSearch(query: string, resultCount: number, latencyMs: number): void {
    const event: SearchAnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'search',
      query,
      timestamp: Date.now(),
      resultCount,
      latencyMs,
    };
    this.events.push(event);
    this.trimEvents();
  }

  trackSelect(query: string, toolId: string): void {
    const event: SearchAnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'select',
      query,
      toolId,
      timestamp: Date.now(),
      resultCount: 0,
      latencyMs: 0,
    };
    this.events.push(event);
    this.addToHistory(query, toolId);
  }

  trackImpression(query: string, toolId: string): void {
    const event: SearchAnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'impression',
      query,
      toolId,
      timestamp: Date.now(),
      resultCount: 0,
      latencyMs: 0,
    };
    this.events.push(event);
    this.trimEvents();
  }

  getHistory(limit = 10): SearchHistoryItem[] {
    return this.history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getPopularQueries(limit = 10): { query: string; count: number }[] {
    const freq = new Map<string, number>();
    for (const evt of this.events) {
      if (evt.type === 'search' && evt.query.trim()) {
        const q = evt.query.toLowerCase().trim();
        freq.set(q, (freq.get(q) ?? 0) + 1);
      }
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  getAvgLatency(): number {
    if (this.events.length === 0) return 0;
    const searchEvents = this.events.filter((e) => e.type === 'search' && e.latencyMs > 0);
    if (searchEvents.length === 0) return 0;
    return searchEvents.reduce((sum, e) => sum + e.latencyMs, 0) / searchEvents.length;
  }

  getEvents(): SearchAnalyticsEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    this.history = [];
  }

  private addToHistory(query: string, toolId: string): void {
    this.history.push({
      query: query.toLowerCase().trim(),
      toolId,
      timestamp: Date.now(),
    });
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  private trimEvents(): void {
    if (this.events.length > this.maxEventsSize) {
      this.events = this.events.slice(-this.maxEventsSize);
    }
  }
}
