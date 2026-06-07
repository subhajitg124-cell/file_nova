/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * This measures edit distance including transpositions (swapped adjacent characters).
 */
export function getDamerauLevenshteinDistance(source: string, target: string): number {
  const s = source.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  const m = s.length;
  const n = t.length;

  if (m === 0) return n;
  if (n === 0) return m;

  // Table has m+2 rows and n+2 columns
  const d: number[][] = Array(m + 2).fill(null).map(() => Array(n + 2).fill(0));

  const maxDist = m + n;
  d[0][0] = maxDist;
  for (let i = 0; i <= m; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }

  const da: Record<string, number> = {};

  for (let i = 1; i <= m; i++) {
    let db = 0;
    for (let j = 1; j <= n; j++) {
      const k = da[t[j - 1]] || 0;
      const l = db;

      let cost = 0;
      if (s[i - 1] === t[j - 1]) {
        cost = 0;
        db = j;
      } else {
        cost = 1;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost, // substitution
        d[i + 1][j] + 1, // insertion
        d[i][j + 1] + 1, // deletion
        d[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    da[s[i - 1]] = i;
  }

  return d[m + 1][n + 1];
}

/**
 * Computes a fuzzy similarity score between 0 and 1.
 * 1 means exact match, 0 means completely different.
 */
export function getFuzzyScore(query: string, target: string): number {
  const distance = getDamerauLevenshteinDistance(query, target);
  const maxLength = Math.max(query.length, target.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - distance / maxLength;
}
