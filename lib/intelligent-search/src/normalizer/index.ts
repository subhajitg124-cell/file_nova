export function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[_\-\/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function tokenize(text: string, removeStopwords = true): string[] {
  const cleaned = normalize(text);
  const tokens = cleaned
    .split(/[\s.,;!?()[\]{}'"<>/\\|~`@#$%^&*+=\-]+/)
    .filter((t) => t.length > 0);
  return removeStopwords ? tokens.filter((t) => !isStopword(t)) : tokens;
}

export function isStopword(word: string): boolean {
  const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'may', 'might', 'must', 'shall', 'can', 'need',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
    'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  ]);
  return STOPWORDS.has(word);
}
