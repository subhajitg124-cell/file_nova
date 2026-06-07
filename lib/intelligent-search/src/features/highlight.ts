export function highlightText(text: string, query: string): { text: string; highlighted: boolean }[] {
  if (!query || query.length === 0) {
    return [{ text, highlighted: false }];
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return [{ text, highlighted: false }];
  const result: { text: string; highlighted: boolean }[] = [];
  if (idx > 0) result.push({ text: text.slice(0, idx), highlighted: false });
  result.push({
    text: text.slice(idx, idx + lowerQuery.length),
    highlighted: true,
  });
  if (idx + lowerQuery.length < text.length) {
    result.push({
      text: text.slice(idx + lowerQuery.length),
      highlighted: false,
    });
  }
  return result;
}
