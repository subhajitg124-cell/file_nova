export const ALIASES: Record<string, string[]> = {
  'img': ['image', 'photo', 'picture'],
  'pic': ['image', 'photo', 'picture'],
  'pdf': ['document', 'pdf'],
  'doc': ['document', 'docx'],
  'compress': ['reduce size', 'shrink', 'optimize'],
  'resize': ['dimensions', 'scale', 'change size'],
  'merge': ['combine', 'join', 'concat'],
  'split': ['extract', 'separate', 'divide'],
  'word': ['docx', 'document'],
  'excel': ['xlsx', 'spreadsheet'],
  'powerpoint': ['pptx', 'presentation'],
  'bg': ['background'],
  'ocr': ['scan', 'text recognition', 'extract text'],
  'convert': ['transform', 'change format'],
};

export function expandAlias(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  const expansions = ALIASES[normalized] || [normalized];
  return expansions;
}

export function getAliasMatches(term: string): string[] {
  const normalized = term.toLowerCase();
  const matches: string[] = [];

  for (const [alias, targets] of Object.entries(ALIASES)) {
    if (targets.some(t => t.includes(normalized) || normalized.includes(t))) {
      matches.push(alias);
    }
  }

  return matches;
}

export function buildAliasIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const [alias, targets] of Object.entries(ALIASES)) {
    index.set(alias, targets);
    for (const target of targets) {
      const existing = index.get(target) || [];
      index.set(target, [...existing, alias]);
    }
  }
  return index;
}