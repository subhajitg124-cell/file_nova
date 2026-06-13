import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OutlineData, SlideData } from "../lib/pptGenerator";
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

  // Render content according to theme layout style
  const renderSlideContent = () => {
    // Fonts mapping
    const fontStyle = {
      fontFamily: theme.pptx.fontFamily === "Times New Roman" ? "'Times New Roman', Times, serif" : "inherit"
    };
    const titleFontStyle = {
      fontFamily: theme.pptx.titleFontFamily === "Georgia" ? "Georgia, serif" : fontStyle.fontFamily
    };

    if (isTitle) {
      return (
        <div
          className="w-full h-full flex flex-col justify-center px-12 relative overflow-hidden"
          style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
        >
          {/* Header Bar Accent */}
          {(theme.pptx.layoutStyle === "bold-header" || theme.pptx.layoutStyle === "split-panel") && (
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: theme.preview.accentColor }} />
          )}

          <h1
            className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
            style={{ color: `#${theme.pptx.titleColor}`, ...titleFontStyle }}
          >
            {outline.title}
          </h1>

          {currentSlide.bullets[0] && (
            <p className="text-lg text-slate-500 italic mb-6" style={{ color: `#${theme.pptx.bodyColor}` }}>
              {currentSlide.bullets[0]}
            </p>
          )}

          <div className="w-16 h-1" style={{ backgroundColor: theme.preview.accentColor }} />
        </div>
      );
    }

    if (isClosing) {
      return (
        <div
          className="w-full h-full flex flex-col justify-center items-center px-12 text-center"
          style={{ backgroundColor: theme.preview.accentColor, ...fontStyle }}
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6" style={titleFontStyle}>
            {currentSlide.heading || "Thank You!"}
          </h1>
          {currentSlide.bullets.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 text-white/80 font-semibold text-sm">
              {currentSlide.bullets.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span>•</span>}
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default layout style rendering
    switch (theme.pptx.layoutStyle) {
      case "bold-header":
        return (
          <div
            className="w-full h-full flex flex-col overflow-hidden"
            style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
          >
            {/* Solid accent banner */}
            <div className="px-10 py-5 flex items-center justify-between text-white" style={{ backgroundColor: theme.preview.accentColor }}>
              <h2 className="text-xl font-bold truncate pr-4" style={titleFontStyle}>
                {currentSlide.heading}
              </h2>
              <span className="text-xs font-mono font-bold select-none">
                {String(activeIndex).padStart(2, "0")}
              </span>
            </div>
            {/* Bullets */}
            <div className="p-10 flex-1 flex flex-col justify-center space-y-4">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: `#${theme.pptx.bodyColor}` }}>
                  <span className="text-lg leading-none" style={{ color: theme.preview.accentColor }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "split-panel":
        return (
          <div
            className="w-full h-full grid grid-cols-12 overflow-hidden"
            style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
          >
            {/* Left Sidebar */}
            <div
              className="col-span-4 p-8 flex flex-col justify-between border-r border-white/5 relative"
              style={{ backgroundColor: `${theme.preview.accentColor}10` }}
            >
              <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: theme.preview.accentColor }} />
              <span className="text-5xl font-black font-mono tracking-tighter" style={{ color: theme.preview.accentColor }}>
                {String(activeIndex).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-black leading-snug mt-6" style={{ color: `#${theme.pptx.titleColor}`, ...titleFontStyle }}>
                {currentSlide.heading}
              </h2>
            </div>
            {/* Right Pane */}
            <div className="col-span-8 p-10 flex flex-col justify-center space-y-4">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: `#${theme.pptx.bodyColor}` }}>
                  <span className="text-lg leading-none" style={{ color: theme.preview.accentColor }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "card-grid":
        return (
          <div
            className="w-full h-full flex flex-col p-10 justify-between"
            style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
          >
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: `#${theme.pptx.titleColor}`, ...titleFontStyle }}>
                {currentSlide.heading}
              </h2>
              <div className="w-12 h-1 mb-6" style={{ backgroundColor: theme.preview.accentColor }} />
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 items-center pb-2">
              {currentSlide.bullets.slice(0, 4).map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border flex items-center justify-center text-xs h-24 overflow-hidden leading-relaxed text-center"
                  style={{
                    backgroundColor: `${theme.preview.accentColor}06`,
                    borderColor: `${theme.preview.accentColor}25`,
                    color: `#${theme.pptx.bodyColor}`
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
          <div
            className="w-full h-full flex flex-col p-10 justify-between"
            style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
          >
            <div className="border-b-2 pb-3 flex items-baseline gap-2" style={{ borderColor: theme.preview.accentColor }}>
              <span className="text-lg font-bold" style={{ color: theme.preview.accentColor }}>
                {activeIndex}.
              </span>
              <h2 className="text-xl font-bold" style={{ color: `#${theme.pptx.titleColor}`, ...titleFontStyle }}>
                {currentSlide.heading}
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4 py-6">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: `#${theme.pptx.bodyColor}` }}>
                  <span className="text-lg leading-none" style={{ color: theme.preview.accentColor }}>•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "minimal":
      default:
        return (
          <div
            className="w-full h-full flex flex-col p-10 justify-between"
            style={{ backgroundColor: `#${theme.pptx.bgColor}`, ...fontStyle }}
          >
            <div>
              <h2 className="text-2xl font-black" style={{ color: `#${theme.pptx.titleColor}`, ...titleFontStyle }}>
                {currentSlide.heading}
              </h2>
              <div className="w-8 h-1 mt-3" style={{ backgroundColor: theme.preview.accentColor }} />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
              {currentSlide.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: `#${theme.pptx.bodyColor}` }}>
                  <span className="text-lg leading-none" style={{ color: theme.preview.accentColor }}>•</span>
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
      <div className="w-full aspect-video rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative bg-slate-950">
        {renderSlideContent()}

        {/* Notes Hover HUD */}
        {currentSlide.speakerNotes && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur border border-white/10 text-[10px] text-slate-400 max-w-sm truncate group hover:max-w-md transition-all">
            📝 <span className="font-semibold">Notes:</span> {currentSlide.speakerNotes}
          </div>
        )}
      </div>

      {/* Slide Deck Pagination HUD */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-white/[0.06] p-3 rounded-2xl">
        <button
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex(prev => prev - 1)}
          className="p-2 bg-slate-950 hover:bg-slate-800 rounded-xl disabled:opacity-30 disabled:hover:bg-slate-950 text-white transition flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs font-black text-slate-400 font-mono uppercase">
          Slide {activeIndex + 1} of {slides.length}
        </span>

        <button
          disabled={activeIndex === slides.length - 1}
          onClick={() => setActiveIndex(prev => prev + 1)}
          className="p-2 bg-slate-950 hover:bg-slate-800 rounded-xl disabled:opacity-30 disabled:hover:bg-slate-950 text-white transition flex items-center gap-1 cursor-pointer font-bold text-xs"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Thumbnails Scroll List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((s, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 w-24 aspect-video rounded-xl border text-left p-1.5 flex flex-col justify-between transition cursor-pointer select-none ${
                isActive
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-white/10 bg-slate-900/40 text-slate-400 hover:bg-slate-900"
              }`}
            >
              <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-tighter block leading-none">
                Slide {idx + 1}
              </span>
              <span className="text-[8.5px] font-bold truncate block w-full leading-tight">
                {s.heading || "Untitled"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default SlidePreview;
