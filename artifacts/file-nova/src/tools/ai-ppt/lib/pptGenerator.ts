import pptxgen from "pptxgenjs";
import type { PPTTheme } from "./themes";

export interface SlideData {
  heading: string;
  bullets: string[];
  speakerNotes?: string;
  suggestedVisual?: string;
}

export interface OutlineData {
  title: string;
  slides: SlideData[];
}

/**
 * Generates a .pptx file as a Blob, applying real layout logic per theme —
 * NOT just text on a white slide. Layout varies by slide position and theme style.
 */
export async function generatePptx(
  outline: OutlineData,
  theme: PPTTheme
): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  outline.slides.forEach((slide, index) => {
    const isTitle = index === 0;
    const isClosing = index === outline.slides.length - 1;

    if (isTitle) {
      addTitleSlide(pptx, outline.title, slide, theme);
    } else if (isClosing) {
      addClosingSlide(pptx, slide, theme);
    } else {
      addContentSlide(pptx, slide, theme, index);
    }
  });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  return blob;
}

// ─── TITLE SLIDE ────────────────────────────────────────────────────────────
function addTitleSlide(pptx: pptxgen, title: string, slide: SlideData, theme: PPTTheme) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.bgColor };

  // Accent shape — varies by layout style for visual distinction
  if (theme.pptx.layoutStyle === "bold-header" || theme.id === "tech-gradient") {
    s.addShape("rect", {
      x: 0, y: 0, w: 13.33, h: 0.15,
      fill: { color: theme.pptx.accentColor },
    });
  }

  s.addText(title, {
    x: 0.8, y: 2.6, w: 11.73, h: 1.5,
    fontSize: 44, bold: true,
    color: theme.pptx.titleColor,
    fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
    align: "left",
  });

  if (slide.bullets[0]) {
    s.addText(slide.bullets[0], {
      x: 0.8, y: 4.1, w: 11.73, h: 0.6,
      fontSize: 20,
      color: theme.pptx.bodyColor,
      fontFace: theme.pptx.fontFamily,
      italic: true,
    });
  }

  // Decorative accent bar
  s.addShape("rect", {
    x: 0.8, y: 4.9, w: 2.5, h: 0.08,
    fill: { color: theme.pptx.accentColor },
  });

  if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
}

// ─── CONTENT SLIDE (layout varies by theme.layoutStyle) ────────────────────
function addContentSlide(pptx: pptxgen, slide: SlideData, theme: PPTTheme, index: number) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.bgColor };

  switch (theme.pptx.layoutStyle) {
    case "bold-header":
      // Full-width colored header bar behind the heading
      s.addShape("rect", {
        x: 0, y: 0, w: 13.33, h: 1.3,
        fill: { color: theme.pptx.accentColor },
      });
      s.addText(slide.heading, {
        x: 0.6, y: 0.25, w: 12.13, h: 0.8,
        fontSize: 30, bold: true, color: "FFFFFF",
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      addBulletList(s, slide.bullets, theme, { x: 0.8, y: 1.8, w: 11.73, h: 5 });
      break;

    case "split-panel":
      // Left accent panel (1/3 width) + right content area
      s.addShape("rect", {
        x: 0, y: 0, w: 4.0, h: 7.5,
        fill: { color: theme.pptx.accentColor, transparency: 85 },
      });
      s.addShape("rect", {
        x: 0, y: 0, w: 0.1, h: 7.5,
        fill: { color: theme.pptx.accentColor },
      });
      s.addText(`${index}`.padStart(2, "0"), {
        x: 0.4, y: 0.5, w: 3, h: 1.5,
        fontSize: 60, bold: true, color: theme.pptx.accentColor,
        fontFace: theme.pptx.fontFamily,
      });
      s.addText(slide.heading, {
        x: 0.4, y: 2.0, w: 3.4, h: 2,
        fontSize: 26, bold: true, color: theme.pptx.titleColor,
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      addBulletList(s, slide.bullets, theme, { x: 4.4, y: 1.0, w: 8.3, h: 5.5 });
      break;

    case "card-grid":
      // Heading on top, bullets rendered as individual "cards"
      s.addText(slide.heading, {
        x: 0.8, y: 0.5, w: 11.73, h: 0.9,
        fontSize: 30, bold: true, color: theme.pptx.titleColor,
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      s.addShape("rect", {
        x: 0.8, y: 1.35, w: 1.8, h: 0.06,
        fill: { color: theme.pptx.accentColor },
      });
      slide.bullets.forEach((bullet, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        s.addShape("roundRect", {
          x: 0.8 + col * 6.0, y: 1.8 + row * 1.7, w: 5.7, h: 1.45,
          fill: { color: theme.pptx.accentColor, transparency: 92 },
          line: { color: theme.pptx.accentColor, width: 1 },
          rectRadius: 0.1,
        });
        s.addText(bullet, {
          x: 1.1 + col * 6.0, y: 1.95 + row * 1.7, w: 5.2, h: 1.15,
          fontSize: 16, color: theme.pptx.bodyColor,
          fontFace: theme.pptx.fontFamily,
          valign: "middle",
        });
      });
      break;

    case "academic":
      // Traditional layout: numbered heading, serif fonts, bottom rule
      s.addText(`${index}.`, {
        x: 0.6, y: 0.5, w: 0.8, h: 0.8,
        fontSize: 28, bold: true, color: theme.pptx.accentColor,
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      s.addText(slide.heading, {
        x: 1.4, y: 0.5, w: 11.3, h: 0.9,
        fontSize: 28, bold: true, color: theme.pptx.titleColor,
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      s.addShape("line", {
        x: 0.6, y: 1.4, w: 12.1, h: 0,
        line: { color: theme.pptx.accentColor, width: 1.5 },
      });
      addBulletList(s, slide.bullets, theme, { x: 1.0, y: 1.8, w: 11.3, h: 5 });
      break;

    case "minimal":
    default:
      s.addText(slide.heading, {
        x: 0.8, y: 0.6, w: 11.73, h: 0.9,
        fontSize: 32, bold: true, color: theme.pptx.titleColor,
        fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
      });
      s.addShape("rect", {
        x: 0.8, y: 1.5, w: 1.5, h: 0.06,
        fill: { color: theme.pptx.accentColor },
      });
      addBulletList(s, slide.bullets, theme, { x: 0.8, y: 1.9, w: 11.73, h: 5 });
      break;
  }

  if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
}

// ─── CLOSING SLIDE ──────────────────────────────────────────────────────────
function addClosingSlide(pptx: pptxgen, slide: SlideData, theme: PPTTheme) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.accentColor };

  s.addText(slide.heading || "Thank You", {
    x: 0.8, y: 2.8, w: 11.73, h: 1.2,
    fontSize: 44, bold: true, color: "FFFFFF",
    fontFace: theme.pptx.titleFontFamily ?? theme.pptx.fontFamily,
    align: "center",
  });

  if (slide.bullets.length > 0) {
    s.addText(slide.bullets.join("  •  "), {
      x: 0.8, y: 4.0, w: 11.73, h: 0.6,
      fontSize: 18, color: "FFFFFF",
      fontFace: theme.pptx.fontFamily,
      align: "center",
    });
  }

  if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
}

// ─── Shared bullet list renderer ────────────────────────────────────────────
function addBulletList(
  s: pptxgen.Slide,
  bullets: string[],
  theme: PPTTheme,
  pos: { x: number; y: number; w: number; h: number }
) {
  s.addText(
    bullets.map((b) => ({
      text: b,
      options: {
        bullet: { code: "2022", color: theme.pptx.accentColor },
        color: theme.pptx.bodyColor,
        fontSize: 18,
        fontFace: theme.pptx.fontFamily,
        breakLine: true,
        paraSpaceAfter: 12,
      },
    })),
    { x: pos.x, y: pos.y, w: pos.w, h: pos.h, valign: "top" }
  );
}
