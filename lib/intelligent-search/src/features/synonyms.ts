export class SynonymMapper {
  private synonyms: Map<string, string>;
  private reverse: Map<string, string>;

  constructor() {
    this.synonyms = new Map();
    this.reverse = new Map();
  }

  add(term: string, synonyms: string[]): void {
    const normalized = term.toLowerCase().trim();
    for (const syn of synonyms) {
      const s = syn.toLowerCase().trim();
      this.synonyms.set(s, normalized);
      this.reverse.set(normalized, s);
    }
    this.synonyms.set(normalized, normalized);
    for (const syn of synonyms) {
      this.synonyms.set(syn.toLowerCase().trim(), normalized);
    }
  }

  addBatch(entries: Record<string, string[]>): void {
    for (const [term, syns] of Object.entries(entries)) {
      this.add(term, syns);
    }
  }

  getCanonical(term: string): string {
    return this.synonyms.get(term.toLowerCase().trim()) ?? term;
  }

  getSynonyms(term: string): string[] {
    const canonical = this.getCanonical(term);
    const result = this.reverse.get(canonical);
    return result ? [result] : [];
  }

  expand(term: string): string[] {
    const canonical = this.getCanonical(term);
    const expansions: string[] = [canonical];
    const syns = this.reverse.get(canonical);
    if (syns) expansions.push(syns);
    return expansions;
  }

  clear(): void {
    this.synonyms.clear();
    this.reverse.clear();
  }

  has(term: string): boolean {
    return this.synonyms.has(term.toLowerCase().trim());
  }
}
