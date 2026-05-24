export interface FileTypeResult {
  extension: string;
  mime: string;
  confidence: 'high' | 'low';
}

export async function detectFileType(file: File): Promise<FileTypeResult> {
  try {
    const headerSlice = file.slice(0, 4100);
    const buffer = await headerSlice.arrayBuffer();
    const arr = new Uint8Array(buffer);
    let hex = "";
    const len = Math.min(arr.length, 16);
    for (let i = 0; i < len; i++) {
      hex += arr[i].toString(16).padStart(2, "0");
    }
    if (hex.startsWith("25504446")) {
      return { extension: "pdf", mime: "application/pdf", confidence: "high" };
    }
    if (hex.startsWith("89504e470d0a1a0a")) {
      return { extension: "png", mime: "image/png", confidence: "high" };
    }
    if (hex.startsWith("ffd8ff")) {
      return { extension: "jpg", mime: "image/jpeg", confidence: "high" };
    }
    if (hex.startsWith("52494646") && hex.substring(16, 24) === "57454250") {
      return { extension: "webp", mime: "image/webp", confidence: "high" };
    }
    if (hex.startsWith("504b0304")) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        return { extension: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", confidence: "high" };
      } else if (ext === 'xlsx') {
        return { extension: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", confidence: "high" };
      } else if (ext === 'pptx') {
        return { extension: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", confidence: "high" };
      }
      return { extension: "zip", mime: "application/zip", confidence: "high" };
    }
    if (hex.substring(8, 16) === "66747970") {
      return { extension: "mp4", mime: "video/mp4", confidence: "high" };
    }
  } catch (error) {
    console.warn("Magic byte detection error, falling back to extension:", error);
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let mime = file.type || 'application/octet-stream';
  if (ext === 'md') mime = 'text/markdown';
  return { extension: ext, mime, confidence: "low" };
}

export function getWorkspaceCategory(mime: string, ext: string): 'pdf' | 'image' | 'office' | 'video' | null {
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (mime.startsWith('video/') || ext === 'mp4') return 'video';
  if (
    mime.includes('officedocument') ||
    mime.includes('word') ||
    mime.includes('sheet') ||
    mime.includes('presentation') ||
    mime === 'text/markdown' ||
    ['docx', 'xlsx', 'pptx', 'md'].includes(ext)
  ) return 'office';
  return null;
}
