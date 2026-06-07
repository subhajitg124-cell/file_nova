export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const la = a.length;
  const lb = b.length;

  if (la === 0) return lb;
  if (lb === 0) return la;

  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[la][lb];
}

export function fuzzyMatch(text: string, pattern: string, threshold: number = 0.7): boolean {
  const distance = levenshteinDistance(text.toLowerCase(), pattern.toLowerCase());
  const maxLength = Math.max(text.length, pattern.length);
  return distance / maxLength <= 1 - threshold;
}

export function fuzzyScore(text: string, pattern: string): number {
  const distance = levenshteinDistance(text.toLowerCase(), pattern.toLowerCase());
  const maxLength = Math.max(text.length, pattern.length);
  return 1 - (distance / Math.max(maxLength, 1));
}

export function findBestMatches(
  candidates: string[],
  query: string,
  limit: number = 5
): Array<{ text: string; score: number }> {
  const scores = candidates.map(text => ({
    text,
    score: fuzzyScore(text, query),
  }));
  return scores
    .filter(s => s.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function partialMatch(text: string, pattern: string): boolean {
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();
  let ti = 0, pi = 0;
  while (ti < t.length && pi < p.length) {
    if (t[ti] === p[pi]) pi++;
    ti++;
  }
  return pi === p.length || p.length === 0;
}

export function multiWordMatch(text: string, pattern: string): boolean {
  const words = pattern.toLowerCase().split(/[\s\-_]+/).filter(Boolean);
  const t = text.toLowerCase();

  return words.every(pw => t.includes(pw));
}

export const fuzzy = {
  distance: levenshteinDistance,
  match: fuzzyMatch,
  score: fuzzyScore,
  findBest: findBestMatches,
  partial: partialMatch,
  multiWord: multiWordMatch,
};

export default fuzzy;