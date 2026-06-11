import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().split("T")[0];

function updateFile(filePath) {
  if (!existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }
  const xml = readFileSync(filePath, "utf8");
  const updated = xml.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  writeFileSync(filePath, updated, "utf8");
  console.log(`Updated lastmod in ${filePath} → ${today}`);
}

updateFile(join(__dirname, "../public/sitemap.xml"));
updateFile(join(__dirname, "../dist/sitemap.xml"));
