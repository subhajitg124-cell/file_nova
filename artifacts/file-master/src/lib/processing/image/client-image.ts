// Client-side image processing using Canvas API (no backend required)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      mime,
      quality
    );
  });
}

// ── Compress / resize ──────────────────────────────────────────────────────
export async function compressImage(
  file: File,
  quality = 0.82,
  maxWidth?: number,
  maxHeight?: number,
  outputFormat?: string
): Promise<Blob> {
  const img = await loadImage(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (maxWidth && w > maxWidth)  { h = Math.round(h * maxWidth / w);  w = maxWidth; }
  if (maxHeight && h > maxHeight){ w = Math.round(w * maxHeight / h); h = maxHeight; }
  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  const mime = outputFormat ? `image/${outputFormat}` : (file.type || 'image/jpeg');
  return canvasToBlob(canvas, mime === 'image/png' ? 'image/png' : mime, quality);
}

// ── Resize to exact dimensions ─────────────────────────────────────────────
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  outputFormat: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  return canvasToBlob(canvas, `image/${outputFormat}`, quality);
}

// ── Convert to ICO (multi-size, embedded PNG) ──────────────────────────────
export async function convertToIco(
  file: File,
  sizes: number[] = [16, 32, 48, 64]
): Promise<Blob> {
  const img = await loadImage(file);
  const pngArrays: Uint8Array[] = [];

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    const blob = await canvasToBlob(canvas, 'image/png', 1.0);
    pngArrays.push(new Uint8Array(await blob.arrayBuffer()));
  }

  const iconCount = sizes.length;
  const headerSize   = 6;
  const dirEntrySize = 16;

  // ICONDIR: reserved(2), type=1(2), count(2)
  const header = new DataView(new ArrayBuffer(6));
  header.setUint16(0, 0, true);
  header.setUint16(2, 1, true);
  header.setUint16(4, iconCount, true);

  let dataOffset = headerSize + dirEntrySize * iconCount;
  const entries: ArrayBuffer[] = [];

  for (let i = 0; i < iconCount; i++) {
    const s   = sizes[i];
    const ent = new DataView(new ArrayBuffer(16));
    ent.setUint8(0, s >= 256 ? 0 : s);   // width  (0 = 256)
    ent.setUint8(1, s >= 256 ? 0 : s);   // height
    ent.setUint8(2, 0);                   // color count
    ent.setUint8(3, 0);                   // reserved
    ent.setUint16(4, 1, true);            // color planes
    ent.setUint16(6, 32, true);           // bits-per-pixel
    ent.setUint32(8, pngArrays[i].byteLength, true);  // data size
    ent.setUint32(12, dataOffset, true);               // data offset
    dataOffset += pngArrays[i].byteLength;
    entries.push(ent.buffer);
  }

  const parts: BlobPart[] = [header.buffer, ...entries, ...pngArrays.map(p => p.buffer)];
  return new Blob(parts, { type: 'image/x-icon' });
}

// ── SVG → PNG ─────────────────────────────────────────────────────────────
export async function convertSvgToPng(
  file: File,
  targetWidth = 512,
  targetHeight = 512
): Promise<Blob> {
  const text = await file.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = targetWidth  || img.naturalWidth  || 512;
      const h = targetHeight || img.naturalHeight || 512;
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      canvasToBlob(canvas, 'image/png', 1.0).then(resolve).catch(reject);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

// ── Convert format (PNG ↔ JPEG ↔ WEBP ↔ BMP) ─────────────────────────────
export async function convertImageFormat(
  file: File,
  targetFormat: 'png' | 'jpeg' | 'webp',
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  if (targetFormat !== 'png') {
    // Fill white background for JPEG (no alpha)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, `image/${targetFormat}`, quality);
}

// ── Get natural image dimensions ──────────────────────────────────────────
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}
