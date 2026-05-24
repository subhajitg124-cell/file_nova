import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { expose } from 'comlink';

async function mergePdfs(filesData: { name: string; buffer: ArrayBuffer }[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const fileData of filesData) {
    const pdf = await PDFDocument.load(fileData.buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
}

async function compressPdf(fileData: { name: string; buffer: ArrayBuffer }, quality: number): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileData.buffer);
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');
  return await pdfDoc.save({ useObjectStreams: quality < 80 });
}

async function splitPdf(
  fileData: { name: string; buffer: ArrayBuffer },
  mode: 'all' | 'every' | 'range',
  splitEvery: number,
  splitRange: string
): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(fileData.buffer);
  const totalPages = srcPdf.getPageCount();
  const chunks: number[][] = [];

  if (mode === 'all') {
    for (let i = 0; i < totalPages; i++) chunks.push([i]);
  } else if (mode === 'every') {
    const n = Math.max(1, splitEvery);
    for (let i = 0; i < totalPages; i += n) {
      chunks.push(Array.from({ length: Math.min(n, totalPages - i) }, (_, k) => i + k));
    }
  } else if (mode === 'range') {
    const parts = splitRange.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => Math.max(0, parseInt(n, 10) - 1));
        const endClamped = Math.min(end, totalPages - 1);
        if (!isNaN(start) && !isNaN(endClamped) && start <= endClamped) {
          chunks.push(Array.from({ length: endClamped - start + 1 }, (_, k) => start + k));
        }
      } else {
        const idx = parseInt(part, 10) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < totalPages) chunks.push([idx]);
      }
    }
  }

  if (chunks.length === 0) throw new Error('No valid pages to split.');

  const results: Uint8Array[] = [];
  for (const pageIndices of chunks) {
    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(srcPdf, pageIndices);
    copied.forEach(p => doc.addPage(p));
    results.push(await doc.save());
  }
  return results;
}

async function imagesToPdf(
  imagesData: { name: string; buffer: ArrayBuffer; mimeType: string }[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  for (const imgData of imagesData) {
    let img;
    if (imgData.mimeType === 'image/jpeg' || imgData.mimeType === 'image/jpg') {
      img = await pdfDoc.embedJpg(imgData.buffer);
    } else {
      img = await pdfDoc.embedPng(imgData.buffer);
    }
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return await pdfDoc.save();
}

// ── PDF Editor operations ───────────────────────────────────────────────────

async function rotatePdfPages(
  fileData: { name: string; buffer: ArrayBuffer },
  rotation: number,
  mode: 'all' | 'specific' | 'odd' | 'even',
  pageList: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileData.buffer);
  const allPages = pdfDoc.getPages();
  const total = allPages.length;

  let indices: number[] = [];
  if (mode === 'all') {
    indices = allPages.map((_, i) => i);
  } else if (mode === 'odd') {
    indices = allPages.map((_, i) => i).filter(i => i % 2 === 0); // 0-indexed odd pages = 1,3,5…
  } else if (mode === 'even') {
    indices = allPages.map((_, i) => i).filter(i => i % 2 === 1);
  } else {
    indices = pageList.map(p => p - 1).filter(i => i >= 0 && i < total);
  }

  for (const idx of indices) {
    const page = allPages[idx];
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation + 360) % 360));
  }
  return await pdfDoc.save();
}

async function deletePdfPages(
  fileData: { name: string; buffer: ArrayBuffer },
  pageList: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileData.buffer);
  const total = pdfDoc.getPageCount();
  // Deduplicate, clamp, sort descending so removal doesn't shift indices
  const toRemove = [...new Set(pageList.map(p => p - 1).filter(i => i >= 0 && i < total))].sort((a, b) => b - a);
  for (const idx of toRemove) {
    pdfDoc.removePage(idx);
  }
  return await pdfDoc.save();
}

async function addPdfWatermark(
  fileData: { name: string; buffer: ArrayBuffer },
  text: string,
  options: {
    fontSize?: number;
    opacity?: number;
    rotation?: number;
    position?: 'diagonal' | 'center' | 'bottom' | 'top';
    colorHex?: string;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileData.buffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { fontSize = 52, opacity = 0.18, rotation = -45, position = 'diagonal', colorHex = '#888888' } = options;

  // Parse hex color
  const hex = colorHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x: number, y: number, rot: number;
    if (position === 'diagonal') {
      x = (width - textWidth) / 2;
      y = (height - textHeight) / 2;
      rot = rotation;
    } else if (position === 'center') {
      x = (width - textWidth) / 2;
      y = height / 2;
      rot = 0;
    } else if (position === 'bottom') {
      x = (width - textWidth) / 2;
      y = 30;
      rot = 0;
    } else {
      x = (width - textWidth) / 2;
      y = height - textHeight - 20;
      rot = 0;
    }

    page.drawText(text, {
      x, y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(rot),
    });
  }
  return await pdfDoc.save();
}

async function addPdfPageNumbers(
  fileData: { name: string; buffer: ArrayBuffer },
  options: {
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center';
    startFrom?: number;
    fontSize?: number;
    prefix?: string;
    suffix?: string;
    colorHex?: string;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileData.buffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const {
    position = 'bottom-center',
    startFrom = 1,
    fontSize = 10,
    prefix = '',
    suffix = '',
    colorHex = '#555555',
  } = options;

  const hex = colorHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const allPages = pdfDoc.getPages();
  allPages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const label = `${prefix}${startFrom + idx}${suffix}`;
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x: number, y: number;
    if (position === 'bottom-center')      { x = (width - textWidth) / 2; y = 20; }
    else if (position === 'bottom-right')  { x = width - textWidth - 30; y = 20; }
    else if (position === 'bottom-left')   { x = 30; y = 20; }
    else                                   { x = (width - textWidth) / 2; y = height - 30; } // top-center

    page.drawText(label, { x, y, size: fontSize, font, color: rgb(r, g, b) });
  });
  return await pdfDoc.save();
}

async function reorderPdfPages(
  fileData: { name: string; buffer: ArrayBuffer },
  newOrder: number[]  // 1-indexed page numbers in desired order
): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(fileData.buffer);
  const total = srcPdf.getPageCount();
  const indices = newOrder.map(p => p - 1).filter(i => i >= 0 && i < total);
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(srcPdf, indices);
  copied.forEach(p => newDoc.addPage(p));
  return await newDoc.save();
}

expose({ mergePdfs, compressPdf, splitPdf, imagesToPdf, rotatePdfPages, deletePdfPages, addPdfWatermark, addPdfPageNumbers, reorderPdfPages });
