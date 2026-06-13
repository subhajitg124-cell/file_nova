/**
 * Lightweight client-side helper: counts likely slide-worthy sections in
 * pasted content BEFORE sending to the AI, so the UI can show
 * "Detected ~6 sections — will generate ~8 slides" feedback instantly.
 * The actual structuring is done by the AI; this is just UX feedback.
 */
export function estimateSlideCount(pastedContent: string): number {
  const lines = pastedContent.split("\n").map((l) => l.trim()).filter(Boolean);

  // Count lines that look like headings: short, end without punctuation,
  // or start with a number/heading marker
  const headingLike = lines.filter((line) => {
    const isShort = line.length < 60;
    const noTrailingPeriod = !line.endsWith(".");
    const looksLikeHeading = /^(\d+[\.\)]|[A-Z][A-Za-z\s]{2,40}:?$)/.test(line);
    return (isShort && noTrailingPeriod) || looksLikeHeading;
  });

  const estimate = Math.max(headingLike.length, Math.ceil(lines.length / 5));
  // Add 2 for title + closing slide, clamp to sensible range
  return Math.min(Math.max(estimate + 2, 5), 20);
}
