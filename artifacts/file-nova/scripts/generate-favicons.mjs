#!/usr/bin/env node

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_LOGO = join(__dirname, '..', 'public', 'logo.png');
const OUT_DIR = join(__dirname, '..', 'public', 'favicons');

// All required sizes
const PNG_SIZES = [16, 32, 48, 96, 128, 180, 192, 256, 512, 1024];
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const APPLE_TOUCH_SIZES = [180, 167, 152, 120, 100, 76, 60, 57];
const ANDROID_SIZES = [192, 512];

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function generatePng(size, outputPath, isMaskable = false) {
  const pipeline = sharp(SRC_LOGO).resize(size, size, {
    fit: 'contain',
    background: { r: 13, g: 27, b: 42, alpha: 1 }, // #0d1b2a
  });

  if (isMaskable) {
    // For maskable icons, add safe area padding (10% on each side)
    const padding = Math.round(size * 0.1);
    pipeline.extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 13, g: 27, b: 42, alpha: 1 },
    });
  }

  await pipeline.png({ quality: 100 }).toFile(outputPath);
  console.log(`  Generated: ${outputPath}`);
}

async function createIco(sizes) {
  // Collect all PNG buffers for ICO sizes
  const pngBuffers = [];
  for (const size of sizes) {
    const buffer = await sharp(SRC_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 13, g: 27, b: 42, alpha: 1 },
      })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer });
  }

  // ICO file format:
  // Header (6 bytes): Reserved (2), Type (2), Count (2)
  // Directory entries (16 bytes each): Width, Height, Colors, Reserved, Planes, BitCount, Size, Offset
  // Image data: PNG buffers

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * pngBuffers.length;

  let dataOffset = headerSize + dirSize;
  let totalSize = dataOffset;

  // Calculate total size
  for (const { buffer } of pngBuffers) {
    totalSize += buffer.length;
  }

  const icoBuffer = Buffer.alloc(totalSize);

  // Write header
  icoBuffer.writeUInt16LE(0, 0);      // Reserved
  icoBuffer.writeUInt16LE(1, 2);      // Type: ICO
  icoBuffer.writeUInt16LE(pngBuffers.length, 4); // Count

  // Write directory entries and image data
  let currentOffset = dataOffset;
  for (let i = 0; i < pngBuffers.length; i++) {
    const { size, buffer } = pngBuffers[i];
    const dirOffset = headerSize + (i * dirEntrySize);

    // Directory entry
    icoBuffer.writeUInt8(size < 256 ? size : 0, dirOffset + 0);     // Width
    icoBuffer.writeUInt8(size < 256 ? size : 0, dirOffset + 1);     // Height
    icoBuffer.writeUInt8(0, dirOffset + 2);     // Colors (0 = >8bpp)
    icoBuffer.writeUInt8(0, dirOffset + 3);     // Reserved
    icoBuffer.writeUInt16LE(1, dirOffset + 4);  // Color planes
    icoBuffer.writeUInt16LE(32, dirOffset + 6); // Bits per pixel
    icoBuffer.writeUInt32LE(buffer.length, dirOffset + 8);  // Image size
    icoBuffer.writeUInt32LE(currentOffset, dirOffset + 12); // Image offset

    // Copy PNG data
    buffer.copy(icoBuffer, currentOffset);
    currentOffset += buffer.length;
  }

  return icoBuffer;
}

async function main() {
  console.log('🎨 FileNova Favicon Generator');
  console.log('==============================\n');

  // Create output directory
  await ensureDir(OUT_DIR);

  // 1. Generate standard PNG favicons
  console.log('1. Generating PNG favicons...');
  for (const size of PNG_SIZES) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
    await generatePng(size, join(OUT_DIR, filename));
  }

  // 2. Generate Apple touch icons
  console.log('\n2. Generating Apple touch icons...');
  for (const size of APPLE_TOUCH_SIZES) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `apple-touch-icon-${size}x${size}.png`;
    await generatePng(size, join(OUT_DIR, filename));
  }

  // 3. Generate Android Chrome icons
  console.log('\n3. Generating Android Chrome icons...');
  for (const size of ANDROID_SIZES) {
    await generatePng(size, join(OUT_DIR, `android-chrome-${size}x${size}.png`));
    // Maskable version
    await generatePng(size, join(OUT_DIR, `android-chrome-${size}x${size}-maskable.png`), true);
  }

  // 4. Generate favicon.ico
  console.log('\n4. Generating favicon.ico...');
  const icoBuffer = await createIco(ICO_SIZES);
  writeFileSync(join(OUT_DIR, 'favicon.ico'), icoBuffer);
  console.log('  Generated: favicon.ico');

  // 5. Copy the main logo as favicon-1024x1024.png
  console.log('\n5. Copying main logo as favicon-1024x1024.png...');
  await sharp(SRC_LOGO)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 13, g: 27, b: 42, alpha: 1 },
    })
    .png()
    .toFile(join(OUT_DIR, 'favicon-1024x1024.png'));
  console.log('  Generated: favicon-1024x1024.png');

  console.log('\n✅ All favicons generated successfully!');
  console.log(`📁 Output directory: ${OUT_DIR}`);
}

main().catch(console.error);
