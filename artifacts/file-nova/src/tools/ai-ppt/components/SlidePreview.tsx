import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OutlineData } from "../lib/pptGenerator";
import type { PPTTheme } from "../lib/themes";

interface SlidePreviewProps {
  outline: OutlineData;
  theme: PPTTheme;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ outline, theme }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = outline.slides;
  const currentSlide = slides[activeIndex];
  if (!currentSlide) return null;

  const isTitle = activeIndex === 0;
  const isClosing = activeIndex === slides.length - 1;

  const { palette } = theme.pptx;

  // Render decoration styles in preview
  const renderDecoration = () => {
    switch (theme.pptx.decoration) {
      case "corner-triangle":
        return (
          <>
            <div
              className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
              style={{
                backgroundColor: `#${palette.primary}`,
                opacity: isClosing ? 1 : 0.12,
                clipPath: "polygon(100% 0, 0 0, 100% 100%)",
              }}
            />
            {isTitle && (
              <div
                className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none"
                style={{
                  backgroundColor: `#${palette.secondary}`,
                  opacity: 0.15,
                  clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                }}
              />
            )}
          </>
        );

      case "diagonal-stripe":
        return (
          <div className="absolute top-0 right-0 bottom-0 w-32 pointer-events-none overflow-hidden opacity-30 flex gap-2 rotate-12 origin-top-right mr-4 -mt-4">
            <div className="w-0.5 h-[150%] shrink-0" style={{ backgroundColor: `#${palette.secondary}` }} />
            <div className="w-0.5 h-[150%] shrink-0" style={{ backgroundColor: `#${palette.primary}` }} />
            <div className="w-0.5 h-[150%] shrink-0" style={{ backgroundColor: `#${palette.secondary}` }} />
          </div>
        );

      case "dot-grid":
        return (
          <div
            className="absolute right-4 top-4 pointer-events-none opacity-40 grid grid-cols-5 gap-1.5"
            style={{ color: `#${palette.secondary}` }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
            ))}
          </div>
        );

      case "circle-cluster":
        return (
          <>
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
              style={{ backgroundColor: `#${palette.secondary}`, opacity: 0.15 }}
            />
            <div
              className="absolute top-16 -right-6 w-24 h-24 rounded-full pointer-events-none"
              style={{ backgroundColor: `#${palette.primary}`, opacity: 0.12 }}
            />
            {isTitle && (
              <div
                className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
                style={{ backgroundColor: `#${palette.primary}`, opacity: 0.1 }}
              />
            )}
          </>
        );

      case "side-bar":
        return (
          <div className="absolute left-0 top-0 bottom-0 w-4 flex pointer-events-none">
            <div className="w-3 h-full" style={{ backgroundColor: `#${palette.primary}` }} />
            <div className="w-1 h-full" style={{ backgroundColor: `#${palette.secondary}` }} />
          </div>
        );

      case "underline-swoosh":
        return null; // Rendered below title inline

      case "none":
      default:
        return null;
    }
  };

  // Render page number style in preview
  const renderPreviewPageNumber = () => {
    if (isTitle || isClosing) return null;

    switch (theme.pptx.pageNumberStyle) {
      case "circle":
        return (
          <div
            className="absolute bottom-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: `#${palette.primary}`, color: `#${palette.onPrimary}` }}
          >
            {activeIndex}
          </div>
        );

      case "bar":
        return (
          <div
            className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-end px-6 text-[9px] font-semibold"
            style={{ backgroundColor: `#${palette.primary}`, color: `#${palette.onPrimary}` }}
          >
            {activeIndex} / {slides.length}
          </div>
        );

      case "minimal":
        return (
          <div
            className="absolute bottom-4 right-6 text-[10px]"
            style={{ color: `#${palette.textMuted}` }}
          >
            {activeIndex}
          </div>
        );

      case "none":
      default:
        return null;
    }
  };

  const renderSlideContent = () => {
    const slide = currentSlide;

    if (isTitle) {
      return (
        <div className="w-full h-full flex flex-col justify-center px-12 relative">
          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-1"
            style={{ color: `#${palette.secondary}` }}
          >
            PRESENTATION
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight tracking-tight max-w-[85%]"
            style={{ color: `#${palette.primary}` }}
          >
            {outline.title}
          </h1>
          {slide.bullets[0] && (
            <p
              className="text-sm italic mb-4 max-w-[80%] leading-relaxed"
              style={{ color: `#${palette.textMuted}` }}
            >
              {slide.bullets[0]}
            </p>
          )}
          {theme.pptx.decoration === "underline-swoosh" ? (
            <div className="space-y-1 mt-1">
              <div className="w-24 h-1 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: `#${palette.primary}` }} />
            </div>
          ) : (
            <div className="w-16 h-1 mt-1 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
          )}
        </div>
      );
    }

    if (isClosing) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center px-12 text-center relative">
          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ color: `#${palette.onPrimary}` }}
          >
            {slide.heading || "Thank You"}
          </h1>
          {slide.bullets.length > 0 && (
            <p
              className="text-sm font-medium opacity-85 max-w-[80%] leading-relaxed"
              style={{ color: `#${palette.onPrimary}` }}
            >
              {slide.bullets.join("   •   ")}
            </p>
          )}
        </div>
      );
    }

    switch (theme.pptx.layoutStyle) {
      case "bold-header":
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="px-8 py-3.5 flex items-center justify-between text-white" style={{ backgroundColor: `#${palette.primary}` }}>
              <h2 className="text-lg font-bold truncate pr-4" style={{ color: `#${palette.onPrimary}` }}>
                {slide.heading}
              </h2>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center space-y-3 pb-8">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                  <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "split-panel":
        return (
          <div className="w-full h-full grid grid-cols-12 overflow-hidden">
            <div
              className="col-span-4 p-6 flex flex-col justify-between relative"
              style={{ backgroundColor: `#${palette.surface}` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: `#${palette.secondary}` }} />
              <span className="text-4xl font-black font-mono tracking-tighter" style={{ color: `#${palette.primary}` }}>
                {String(activeIndex).padStart(2, "0")}
              </span>
              <h2 className="text-sm font-bold leading-snug mt-4" style={{ color: `#${palette.primary}` }}>
                {slide.heading}
              </h2>
            </div>
            <div className="col-span-8 p-8 flex flex-col justify-center space-y-3">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                  <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "card-grid":
        return (
          <div className="w-full h-full flex flex-col p-8 justify-between">
            <div className="mb-2">
              <h2 className="text-lg font-bold" style={{ color: `#${palette.primary}` }}>
                {slide.heading}
              </h2>
              <div className="w-12 h-0.5 mt-1 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 items-center py-2 pb-4">
              {slide.bullets.slice(0, 4).map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border flex items-center justify-center text-[10px] h-[72px] overflow-hidden leading-relaxed text-center"
                  style={{
                    backgroundColor: `#${palette.surface}`,
                    borderColor: `#${palette.secondary}40`,
                    color: `#${palette.text}`,
                  }}
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        );

      case "academic":
        return (
          <div className="w-full h-full flex flex-col p-8 justify-between">
            <div className="border-b-2 pb-2 flex items-baseline gap-1.5" style={{ borderColor: `#${palette.primary}` }}>
              <span className="text-md font-bold" style={{ color: `#${palette.secondary}` }}>
                {activeIndex}.
              </span>
              <h2 className="text-md font-bold" style={{ color: `#${palette.primary}` }}>
                {slide.heading}
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3 py-3 pb-6">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                  <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "magazine":
        return (
          <div className="w-full h-full grid grid-cols-12 overflow-hidden">
            <div
              className="col-span-4 p-6 flex flex-col justify-between relative"
              style={{ backgroundColor: `#${palette.surface}` }}
            >
              <span className="text-md font-bold tracking-widest" style={{ color: `#${palette.secondary}` }}>
                {String(activeIndex).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-base font-extrabold leading-snug" style={{ color: `#${palette.primary}` }}>
                  {slide.heading}
                </h2>
                <div className="w-10 h-0.5 mt-2 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
              </div>
            </div>
            <div className="col-span-8 p-8 flex flex-col justify-center space-y-3">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                  <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>▪</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "timeline":
        const hasFewBullets = slide.bullets.length <= 3;
        return (
          <div className="w-full h-full flex flex-col p-8 justify-between relative">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `#${palette.primary}`, color: `#${palette.onPrimary}` }}
              >
                {activeIndex}
              </div>
              <h2 className="text-md font-extrabold truncate" style={{ color: `#${palette.primary}` }}>
                {slide.heading}
              </h2>
              <div className="flex-1 h-0.5" style={{ backgroundColor: `#${palette.secondary}40` }} />
            </div>

            {hasFewBullets ? (
              <div className="grid grid-cols-3 gap-3 flex-1 items-center py-2 pb-4">
                {slide.bullets.slice(0, 3).map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border flex flex-col gap-1.5 text-[10px] h-32 overflow-hidden leading-relaxed text-left"
                    style={{
                      backgroundColor: `#${palette.surface}`,
                      borderColor: `#${palette.secondary}40`,
                      color: `#${palette.text}`,
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: `#${palette.secondary}` }} />
                    <span className="line-clamp-4">{bullet}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center space-y-2.5 pb-4">
                {slide.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                    <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "dark-luxe":
        return (
          <div className="w-full h-full flex flex-col p-8 justify-between">
            <div className="mb-2">
              <h2 className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
                {slide.heading}
              </h2>
              <div className="flex gap-1 mt-1">
                <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: `#${palette.primary}` }} />
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 items-center py-2 pb-4">
              {slide.bullets.slice(0, 4).map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border flex items-center gap-2 text-[10px] h-[64px] overflow-hidden leading-relaxed text-left"
                  style={{
                    backgroundColor: `#${palette.surface}`,
                    borderColor: `#${palette.primary}60`,
                    color: `#${palette.text}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `#${palette.primary}` }} />
                  <span className="line-clamp-3">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "minimal":
      default:
        return (
          <div className="w-full h-full flex flex-col p-8 justify-between">
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: `#${palette.primary}` }}>
                {slide.heading}
              </h2>
              <div className="w-10 h-0.5 mt-1.5 rounded-full" style={{ backgroundColor: `#${palette.secondary}` }} />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3 py-3 pb-6">
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: `#${palette.text}` }}>
                  <span className="text-sm leading-none" style={{ color: `#${palette.secondary}` }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Slide Screen Frame */}
      <div
        className="w-full rounded-2xl border border-border overflow-hidden shadow-2xl relative select-none"
        style={{
          aspectRatio: "16/9",
          backgroundColor: `#${isClosing ? palette.primary : palette.background}`,
        }}
      >
        {renderDecoration()}
        {renderSlideContent()}
        {renderPreviewPageNumber()}

        {/* Notes Hover HUD */}
        {currentSlide.speakerNotes && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border text-[10px] max-w-sm truncate shadow-md transition-all z-20 cursor-default"
            style={{
              backgroundColor: `#${palette.surface}`,
              borderColor: `#${palette.secondary}40`,
              color: `#${palette.text}`,
            }}
            title={currentSlide.speakerNotes}
          >
            📝 <span className="font-semibold text-[9px] uppercase tracking-wider opacity-75">Notes:</span> {currentSlide.speakerNotes}
          </div>
        )}
      </div>

      {/* Slide Deck Pagination HUD */}
      <div className="flex justify-between items-center bg-muted border border-border p-2.5 rounded-xl">
        <button
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((prev) => prev - 1)}
          title="Go to previous slide"
          className="p-1.5 bg-card hover:bg-muted/80 border border-border rounded-lg disabled:opacity-30 text-foreground transition flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs font-bold text-muted-foreground font-mono">
          Slide {activeIndex + 1} of {slides.length}
        </span>

        <button
          disabled={activeIndex === slides.length - 1}
          onClick={() => setActiveIndex((prev) => prev + 1)}
          title="Go to next slide"
          className="p-1.5 bg-card hover:bg-muted/80 border border-border rounded-lg disabled:opacity-30 text-foreground transition flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Thumbnails Scroll List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((s, idx) => {
          const isActive = idx === activeIndex;
          const thumbnailBg = idx === slides.length - 1 ? palette.primary : palette.background;
          const thumbnailHeadingColor = idx === slides.length - 1 ? palette.onPrimary : palette.text;
          const thumbnailHeadingMuted = idx === slides.length - 1 ? palette.onPrimary : palette.textMuted;

          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              title={`Go to slide ${idx + 1}: ${s.heading || "Closing Slide"}`}
              className={`shrink-0 w-24 aspect-video rounded-lg border text-left p-2 flex flex-col justify-between transition cursor-pointer select-none ${
                isActive
                  ? "border-purple-600 ring-2 ring-purple-600/30"
                  : "border-border hover:border-purple-300"
              }`}
              style={{ backgroundColor: `#${thumbnailBg}` }}
            >
              <span
                className="text-[7px] font-bold uppercase tracking-wider block leading-none"
                style={{ color: `#${thumbnailHeadingMuted}`, opacity: 0.7 }}
              >
                Slide {idx + 1}
              </span>
              <span
                className="text-[8px] font-extrabold truncate block w-full leading-tight"
                style={{ color: `#${thumbnailHeadingColor}` }}
              >
                {idx === 0 ? "Title" : idx === slides.length - 1 ? "Closing" : s.heading || "Untitled"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlidePreview;
