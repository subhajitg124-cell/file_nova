import type { ToolMetadata, SearchConfig, SearchResult } from './types.js';

export class SearchCache<K, V> {
  private cache = new Map<string, { value: V; expires: number }>();

  constructor(private readonly maxAge: number) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(this.serialize(key));
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.cache.delete(this.serialize(key));
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    this.cache.set(this.serialize(key), {
      value,
      expires: Date.now() + this.maxAge,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    const entry = this.cache.get(this.serialize(key));
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.cache.delete(this.serialize(key));
      return false;
    }
    return true;
  }

  size(): number {
    return this.cache.size;
  }

  private serialize(key: K): string {
    return JSON.stringify(key);
  }
}

export function buildSearchIndex(tools: ToolMetadata[]): Map<string, ToolMetadata> {
  return new Map(tools.map((t) => [t.id, t]));
}

export function mergeTools(
  existing: ToolMetadata[],
  incoming: ToolMetadata[],
): ToolMetadata[] {
  const map = new Map<string, ToolMetadata>();
  for (const t of existing) map.set(t.id, t);
  for (const t of incoming) {
    if (map.has(t.id)) {
      map.set(t.id, { ...map.get(t.id)!, ...t });
    } else {
      map.set(t.id, t);
    }
  }
  return Array.from(map.values());
}

export function sortResults(results: SearchResult[]): SearchResult[] {
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}
