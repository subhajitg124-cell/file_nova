import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, 'public');
const svgPath = path.join(publicDir, 'faviconfinal.svg');

async function generate() {
  console.log('Generating PNG and SVG favicons...');

  // 1. Copy faviconfinal.svg to favicon.svg
  fs.copyFileSync(svgPath, path.join(publicDir, 'favicon.svg'));
  console.log('Copied faviconfinal.svg to favicon.svg');

  // Helper to render SVG to PNG at specific size
  async function renderSvgToPng(size, destName) {
    const destPath = path.join(publicDir, destName);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(destPath);
    console.log(`Generated ${destName} (${size}x${size})`);
  }

  // 2. Render all PNG files
  await renderSvgToPng(16, 'icon-16x16.png');
  await renderSvgToPng(32, 'icon-32x32.png');
  await renderSvgToPng(180, 'apple-touch-icon.png');
  await renderSvgToPng(192, 'icon-192x192.png');
  await renderSvgToPng(512, 'icon-512x512.png');
  await renderSvgToPng(192, 'android-chrome-192x192.png');
  await renderSvgToPng(512, 'android-chrome-512x512.png');
  await renderSvgToPng(512, 'icon.png');

  // Also render a temporary 48x48 PNG for favicon.ico creation
  await renderSvgToPng(48, 'temp-48x48.png');

  console.log('Invoking Python script to compile favicon.ico using Pillow...');
  // 3. Compile favicon.ico using Python script
  const pythonScript = `
from PIL import Image
import os

public_dir = r"${publicDir.replace(/\\/g, '\\\\')}"
img_16 = Image.open(os.path.join(public_dir, "icon-16x16.png"))
img_32 = Image.open(os.path.join(public_dir, "icon-32x32.png"))
img_48 = Image.open(os.path.join(public_dir, "temp-48x48.png"))

ico_path = os.path.join(public_dir, "favicon.ico")
img_16.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[img_32, img_48])
print("Successfully generated favicon.ico")

# Cleanup temp file
try:
    os.remove(os.path.join(public_dir, "temp-48x48.png"))
except Exception as e:
    print("Warning: could not delete temp-48x48.png:", e)
`;
  
  const pyTempPath = path.join(__dirname, 'temp_compile_ico.py');
  fs.writeFileSync(pyTempPath, pythonScript);
  
  try {
    const output = execSync(`python "${pyTempPath}"`, { encoding: 'utf8' });
    console.log(output);
  } finally {
    try {
      fs.unlinkSync(pyTempPath);
    } catch (_) {}
  }
}

generate().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
