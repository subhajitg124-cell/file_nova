/**
 * Local (no-login) history of recent tool uses.
 * Stores only enum-like config values — never free-text user input.
 *
 * Uses an explicit ALLOWLIST (not a denylist) so that any new tool's
 * free-text fields are automatically excluded unless deliberately added.
 */

export interface LocalHistoryEntry {
  toolId: string;
  toolLabel: string;
  timestamp: number;
  /** Only allowlisted keys stored — see SAFE_CONFIG_KEYS */
  configUsed: Record<string, number | boolean | string>;
}

/**
 * Allowlisted config keys safe to persist locally.
 * Excludes: watermark_text, signature_text, passwords, any free-text input.
 * Includes: preset names, numeric quality/size values, boolean toggles, format enums.
 */
export const SAFE_CONFIG_KEYS = new Set([
  "quality",
  "compress_preset",
  "compression_target",
  "resize_width",
  "resize_height",
  "resize_format",
  "resize_lock_aspect",
  "resize_pct",
  "target_format",
  "split_mode",
  "split_every",
  "rotate_deg",
  "rotate_pages_mode",
  "page_num_position",
  "page_num_start",
  "ocr_output",
  "ocr_lang",
  "enhance_preset",
  "brightness",
  "contrast",
  "sharpness",
  "denoise",
  "crf",
  "preset",
  "audio_bitrate",
  "audio_format",
  "remove_bg_format",
  "ico_sizes",
  "svg_width",
  "svg_height",
  "dpi",
  "compare_mode",
  "compare_output",
  "summary_length",
  "summary_format",
  "forms_action",
  "pdfa_level",
  "protect_level",
  "sign_page",
  "sign_size",
  "sign_underline",
  "sign_box",
  "img_wm_position",
  "img_wm_opacity",
  "img_wm_tile",
  "watermark_position",
  "watermark_size",
  "watermark_opacity",
  "watermark_rotation",
]);

const STORAGE_KEY = "filenova_local_history";
const MAX_ENTRIES = 30;
const RECENT_DAYS = 7;

function filterSafeConfig(
  raw: Record<string, unknown>
): Record<string, number | boolean | string> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([k, v]) =>
        SAFE_CONFIG_KEYS.has(k) &&
        (typeof v === "number" || typeof v === "boolean" || typeof v === "string")
      )
  ) as Record<string, number | boolean | string>;
}

export function recordLocalHistory(
  entry: Omit<LocalHistoryEntry, "configUsed"> & { configUsed: Record<string, unknown> }
): void {
  try {
    const safeConfig = filterSafeConfig(entry.configUsed);
    const existing = getLocalHistory();
    const updated = [
      { ...entry, configUsed: safeConfig } as LocalHistoryEntry,
      ...existing,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore, never break the UI
  }
}

export function getLocalHistory(): LocalHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getLastEntryForTool(toolId: string): LocalHistoryEntry | null {
  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  return (
    getLocalHistory().find(
      (e) => e.toolId === toolId && e.timestamp >= cutoff
    ) ?? null
  );
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Per-tool dismissal state — persisted so banner doesn't re-appear after dismiss */
const DISMISS_KEY = "filenova_history_dismissed";

export function isDismissedForTool(toolId: string): boolean {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "{}");
    return !!raw[toolId];
  } catch {
    return false;
  }
}

export function dismissForTool(toolId: string): void {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "{}");
    raw[toolId] = true;
    localStorage.setItem(DISMISS_KEY, JSON.stringify(raw));
  } catch {
    // ignore
  }
}
