import pptxgen from "pptxgenjs";
import type { PPTTheme } from "./themes";
import { applyDecoration, applyPageNumber } from "./decorations";

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
      addContentSlide(pptx, slide, theme, index, outline.slides.length);
    }
  });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  return blob;
}

// ─── TITLE SLIDE ────────────────────────────────────────────────────────────
function addTitleSlide(pptx: pptxgen, title: string, slide: SlideData, theme: PPTTheme) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.palette.background };

  applyDecoration(s, theme.pptx.decoration, theme, "title");

  s.addText("PRESENTATION", {
    x: 0.8, y: 2.0, w: 6, h: 0.4,
    fontSize: 13, bold: true,
    color: theme.pptx.palette.secondary,
    fontFace: theme.pptx.fonts.body,
    charSpacing: 3,
  });

  s.addText(title, {
    x: 0.8, y: 2.5, w: 11.73, h: 1.6,
    fontSize: 46, bold: true,
    color: theme.pptx.palette.primary,
    fontFace: theme.pptx.fonts.heading,
    align: "left",
  });

  if (slide.bullets[0]) {
    s.addText(slide.bullets[0], {
      x: 0.8, y: 4.2, w: 9, h: 0.6,
      fontSize: 18,
      color: theme.pptx.palette.textMuted,
      fontFace: theme.pptx.fonts.body,
      italic: true,
    });
  }

  if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
}

// ─── CONTENT SLIDE (layout varies by theme.layoutStyle) ────────────────────
function addContentSlide(
  pptx: pptxgen,
  slide: SlideData,
  theme: PPTTheme,
  index: number,
  totalSlides: number
) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.palette.background };

  switch (theme.pptx.layoutStyle) {
    case "bold-header":
      // Full-width colored header bar behind the heading
      s.addShape("rect", {
        x: 0, y: 0, w: 13.33, h: 1.3,
        fill: { color: theme.pptx.palette.primary },
      });
      s.addText(slide.heading, {
        x: 0.6, y: 0.25, w: 12.13, h: 0.8,
        fontSize: 30, bold: true, color: theme.pptx.palette.onPrimary,
        fontFace: theme.pptx.fonts.heading,
      });
      addBulletList(s, slide.bullets, theme, { x: 0.8, y: 1.8, w: 11.73, h: 5 });
      applyPageNumber(s, index, totalSlides, theme);
      break;

    case "split-panel":
      // Left accent panel (1/3 width) + right content area
      s.addShape("rect", {
        x: 0, y: 0, w: 4.0, h: 7.5,
        fill: { color: theme.pptx.palette.surface },
      });
      s.addShape("rect", {
        x: 0, y: 0, w: 0.1, h: 7.5,
        fill: { color: theme.pptx.palette.secondary },
      });
      s.addText(`${index}`.padStart(2, "0"), {
        x: 0.4, y: 0.5, w: 3, h: 1.5,
        fontSize: 60, bold: true, color: theme.pptx.palette.primary,
        fontFace: theme.pptx.fonts.heading,
      });
      s.addText(slide.heading, {
        x: 0.4, y: 2.0, w: 3.4, h: 2,
        fontSize: 26, bold: true, color: theme.pptx.palette.primary,
        fontFace: theme.pptx.fonts.heading,
      });
      addBulletList(s, slide.bullets, theme, { x: 4.4, y: 1.0, w: 8.3, h: 5.5 });
      applyPageNumber(s, index, totalSlides, theme);
      break;

    case "card-grid":
      // Heading on top, bullets rendered as individual "cards"
      s.addText(slide.heading, {
        x: 0.8, y: 0.5, w: 11.73, h: 0.9,
        fontSize: 30, bold: true, color: theme.pptx.palette.primary,
        fontFace: theme.pptx.fonts.heading,
      });
      s.addShape("rect", {
        x: 0.8, y: 1.35, w: 1.8, h: 0.06,
        fill: { color: theme.pptx.palette.secondary },
      });
      slide.bullets.forEach((bullet, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        s.addShape("roundRect", {
          x: 0.8 + col * 6.0, y: 1.8 + row * 1.7, w: 5.7, h: 1.45,
          fill: { color: theme.pptx.palette.surface },
          line: { color: theme.pptx.palette.secondary, width: 1, transparency: 60 },
          rectRadius: 0.1,
        });
        s.addText(bullet, {
          x: 1.1 + col * 6.0, y: 1.95 + row * 1.7, w: 5.2, h: 1.15,
          fontSize: 16, color: theme.pptx.palette.text,
          fontFace: theme.pptx.fonts.body,
          valign: "middle",
        });
      });
      applyPageNumber(s, index, totalSlides, theme);
      break;

    case "academic":
      // Traditional layout: numbered heading, serif fonts, bottom rule
      s.addText(`${index}.`, {
        x: 0.6, y: 0.5, w: 0.8, h: 0.8,
        fontSize: 28, bold: true, color: theme.pptx.palette.secondary,
        fontFace: theme.pptx.fonts.heading,
      });
      s.addText(slide.heading, {
        x: 1.4, y: 0.5, w: 11.3, h: 0.9,
        fontSize: 28, bold: true, color: theme.pptx.palette.primary,
        fontFace: theme.pptx.fonts.heading,
      });
      s.addShape("line", {
        x: 0.6, y: 1.4, w: 12.1, h: 0,
        line: { color: theme.pptx.palette.primary, width: 1.5 },
      });
      addBulletList(s, slide.bullets, theme, { x: 1.0, y: 1.8, w: 11.3, h: 5 });
      applyPageNumber(s, index, totalSlides, theme);
      break;

    case "magazine": {
      const { primary, secondary, surface, text } = theme.pptx.palette;

      s.background = { color: theme.pptx.palette.background };
      s.addShape("rect", { x: 0, y: 0, w: 4.6, h: 7.5, fill: { color: surface } });

      s.addText(`0${index}`, {
        x: 0.6, y: 0.6, w: 2, h: 1,
        fontSize: 22, bold: true, color: secondary,
        fontFace: theme.pptx.fonts.body, charSpacing: 2,
      });

      s.addText(slide.heading, {
        x: 0.6, y: 1.5, w: 3.6, h: 3,
        fontSize: 32, bold: true, color: primary,
        fontFace: theme.pptx.fonts.heading,
      });

      s.addShape("rect", { x: 0.6, y: 4.7, w: 1.2, h: 0.06, fill: { color: secondary } });

      s.addText(slide.bullets.map((b) => ({
        text: b,
        options: {
          bullet: { code: "25AA", color: secondary },
          color: text, fontSize: 17,
          fontFace: theme.pptx.fonts.body,
          breakLine: true, paraSpaceAfter: 14,
        },
      })), { x: 5.1, y: 1.0, w: 7.6, h: 5.8, valign: "top" });

      applyPageNumber(s, index, totalSlides, theme);
      break;
    }

    case "timeline": {
      const { primary, secondary, surface, text, onPrimary } = theme.pptx.palette;
      s.background = { color: theme.pptx.palette.background };

      s.addShape("ellipse", { x: 0.6, y: 0.5, w: 1.0, h: 1.0, fill: { color: primary } });
      s.addText(`${index}`, {
        x: 0.6, y: 0.5, w: 1.0, h: 1.0,
        fontSize: 32, bold: true, color: onPrimary,
        align: "center", valign: "middle",
        fontFace: theme.pptx.fonts.heading,
      });

      s.addShape("rect", {
        x: 1.65, y: 0.96, w: 9.5, h: 0.04,
        fill: { color: secondary, transparency: 50 },
      });

      s.addText(slide.heading, {
        x: 1.95, y: 0.4, w: 9.0, h: 1.2,
        fontSize: 28, bold: true, color: primary,
        fontFace: theme.pptx.fonts.heading, valign: "middle",
      });

      if (slide.bullets.length <= 3) {
        slide.bullets.forEach((bullet, i) => {
          s.addShape("roundRect", {
            x: 0.8 + i * 4.0, y: 2.2, w: 3.7, h: 4.4,
            fill: { color: surface },
            line: { color: secondary, width: 1, transparency: 60 },
            rectRadius: 0.12,
          });
          s.addShape("ellipse", { x: 1.1 + i * 4.0, y: 2.5, w: 0.4, h: 0.4, fill: { color: secondary } });
          s.addText(bullet, {
            x: 1.0 + i * 4.0, y: 3.1, w: 3.3, h: 3.3,
            fontSize: 15, color: text,
            fontFace: theme.pptx.fonts.body, valign: "top",
          });
        });
      } else {
        addBulletList(s, slide.bullets, theme, { x: 1.95, y: 2.0, w: 10.5, h: 4.8 });
      }

      applyPageNumber(s, index, totalSlides, theme);
      break;
    }

    case "dark-luxe": {
      const { primary, secondary, surface, text } = theme.pptx.palette;
      s.background = { color: theme.pptx.palette.background };

      applyDecoration(s, theme.pptx.decoration, theme, "content");

      s.addText(slide.heading, {
        x: 0.8, y: 0.7, w: 11.73, h: 1.0,
        fontSize: 32, bold: true, color: "FFFFFF",
        fontFace: theme.pptx.fonts.heading,
      });
      s.addShape("rect", { x: 0.8, y: 1.65, w: 2.0, h: 0.05, fill: { color: primary } });
      s.addShape("rect", { x: 2.85, y: 1.65, w: 0.5, h: 0.05, fill: { color: secondary } });

      slide.bullets.forEach((bullet, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        s.addShape("roundRect", {
          x: 0.8 + col * 6.0, y: 2.1 + row * 1.55, w: 5.7, h: 1.35,
          fill: { color: surface },
          line: { color: primary, width: 0.75, transparency: 40 },
          rectRadius: 0.1,
        });
        s.addShape("ellipse", { x: 1.05 + col * 6.0, y: 2.35 + row * 1.55, w: 0.18, h: 0.18, fill: { color: primary } });
        s.addText(bullet, {
          x: 1.35 + col * 6.0, y: 2.2 + row * 1.55, w: 4.9, h: 1.15,
          fontSize: 14, color: text,
          fontFace: theme.pptx.fonts.body, valign: "middle",
        });
      });

      applyPageNumber(s, index, totalSlides, theme);
      break;
    }

    case "minimal":
    default:
      s.addText(slide.heading, {
        x: 0.8, y: 0.6, w: 11.73, h: 0.9,
        fontSize: 32, bold: true, color: theme.pptx.palette.primary,
        fontFace: theme.pptx.fonts.heading,
      });
      s.addShape("rect", {
        x: 0.8, y: 1.5, w: 1.5, h: 0.06,
        fill: { color: theme.pptx.palette.secondary },
      });
      addBulletList(s, slide.bullets, theme, { x: 0.8, y: 1.9, w: 11.73, h: 5 });
      applyPageNumber(s, index, totalSlides, theme);
      break;
  }

  if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
}

// ─── CLOSING SLIDE ──────────────────────────────────────────────────────────
function addClosingSlide(pptx: pptxgen, slide: SlideData, theme: PPTTheme) {
  const s = pptx.addSlide();
  s.background = { color: theme.pptx.palette.primary };

  applyDecoration(s, theme.pptx.decoration, theme, "closing");

  s.addText(slide.heading || "Thank You", {
    x: 0.8, y: 2.8, w: 11.73, h: 1.2,
    fontSize: 48, bold: true, color: theme.pptx.palette.onPrimary,
    fontFace: theme.pptx.fonts.heading,
    align: "center",
  });

  if (slide.bullets.length > 0) {
    s.addText(slide.bullets.join("   •   "), {
      x: 0.8, y: 4.1, w: 11.73, h: 0.6,
      fontSize: 18, color: theme.pptx.palette.onPrimary,
      fontFace: theme.pptx.fonts.body,
      align: "center",
      transparency: 15,
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
        bullet: { code: "2022", color: theme.pptx.palette.secondary },
        color: theme.pptx.palette.text,
        fontSize: 18,
        fontFace: theme.pptx.fonts.body,
        breakLine: true,
        paraSpaceAfter: 12,
      },
    })),
    { x: pos.x, y: pos.y, w: pos.w, h: pos.h, valign: "top" }
  );
}
