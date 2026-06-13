import type pptxgen from "pptxgenjs";
import type { PPTTheme, DecorationShape } from "./themes";

export function applyDecoration(
  slide: pptxgen.Slide,
  decoration: DecorationShape,
  theme: PPTTheme,
  variant: "title" | "closing" | "content" = "title"
) {
  const { primary, secondary } = theme.pptx.palette;

  switch (decoration) {
    case "corner-triangle":
      slide.addShape("triangle", {
        x: 10.5, y: -1.5, w: 4.5, h: 4.5,
        fill: { color: primary, transparency: variant === "closing" ? 0 : 88 },
        rotate: 90,
      });
      if (variant === "title") {
        slide.addShape("triangle", {
          x: -1.2, y: 6.0, w: 2.5, h: 2.5,
          fill: { color: secondary, transparency: 85 },
          rotate: 270,
        });
      }
      break;

    case "diagonal-stripe":
      for (let i = 0; i < 3; i++) {
        slide.addShape("rect", {
          x: 9.5 + i * 0.6, y: -1, w: 0.08, h: 10,
          fill: { color: i === 1 ? primary : secondary, transparency: 70 + i * 5 },
          rotate: 25,
        });
      }
      break;

    case "dot-grid": {
      const cols = 5, rows = 4, spacing = 0.22, dotSize = 0.06;
      const startX = variant === "title" ? 11.8 : 12.4;
      const startY = variant === "title" ? 0.5 : 6.3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          slide.addShape("ellipse", {
            x: startX + c * spacing, y: startY + r * spacing,
            w: dotSize, h: dotSize,
            fill: { color: secondary, transparency: 40 },
          });
        }
      }
      break;
    }

    case "circle-cluster":
      slide.addShape("ellipse", {
        x: 10.8, y: -1.2, w: 3.5, h: 3.5,
        fill: { color: secondary, transparency: 85 },
      });
      slide.addShape("ellipse", {
        x: 12.0, y: 0.6, w: 2.2, h: 2.2,
        fill: { color: primary, transparency: 88 },
      });
      if (variant === "title") {
        slide.addShape("ellipse", {
          x: -1.0, y: 5.5, w: 2.8, h: 2.8,
          fill: { color: primary, transparency: 90 },
        });
      }
      break;

    case "side-bar":
      slide.addShape("rect", { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: primary } });
      slide.addShape("rect", { x: 0.35, y: 0, w: 0.06, h: 7.5, fill: { color: secondary } });
      break;

    case "underline-swoosh":
      slide.addShape("rect", {
        x: 0.8, y: variant === "title" ? 4.85 : 1.5, w: 3.2, h: 0.05,
        fill: { color: secondary },
      });
      slide.addShape("rect", {
        x: 0.8, y: (variant === "title" ? 4.85 : 1.5) + 0.12, w: 1.4, h: 0.05,
        fill: { color: primary },
      });
      break;

    case "none":
    default:
      break;
  }
}

export function applyPageNumber(
  slide: pptxgen.Slide,
  pageNum: number,
  totalPages: number,
  theme: PPTTheme
) {
  const { primary, onPrimary, textMuted } = theme.pptx.palette;

  switch (theme.pptx.pageNumberStyle) {
    case "circle":
      slide.addShape("ellipse", { x: 12.55, y: 6.85, w: 0.5, h: 0.5, fill: { color: primary } });
      slide.addText(`${pageNum}`, {
        x: 12.55, y: 6.85, w: 0.5, h: 0.5,
        fontSize: 12, bold: true, color: onPrimary,
        align: "center", valign: "middle",
        fontFace: theme.pptx.fonts.body,
      });
      break;

    case "bar":
      slide.addShape("rect", { x: 0, y: 7.2, w: 13.33, h: 0.3, fill: { color: primary } });
      slide.addText(`${pageNum} / ${totalPages}`, {
        x: 12.0, y: 7.2, w: 1.2, h: 0.3,
        fontSize: 10, color: onPrimary,
        align: "right", valign: "middle",
        fontFace: theme.pptx.fonts.body,
      });
      break;

    case "minimal":
      slide.addText(`${pageNum}`, {
        x: 12.7, y: 7.05, w: 0.5, h: 0.35,
        fontSize: 11, color: textMuted,
        align: "right",
        fontFace: theme.pptx.fonts.body,
      });
      break;

    case "none":
    default:
      break;
  }
}
