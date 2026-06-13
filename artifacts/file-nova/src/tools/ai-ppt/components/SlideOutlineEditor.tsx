import React, { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, Sparkles, AlertCircle } from "lucide-react";
import type { OutlineData, SlideData } from "../lib/pptGenerator";
import { PPT_THEMES } from "../lib/themes";

interface SlideOutlineEditorProps {
  outline: OutlineData;
  onChange: (updated: OutlineData) => void;
  onRegenerateSlide: (slideIndex: number, instructions?: string) => Promise<void>;
  themeId: string;
  onThemeChange: (id: string) => void;
}

export const SlideOutlineEditor: React.FC<SlideOutlineEditorProps> = ({
  outline,
  onChange,
  onRegenerateSlide,
  themeId,
  onThemeChange
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [instructions, setInstructions] = useState<Record<number, string>>({});
  const [loadingSlide, setLoadingSlide] = useState<Record<number, boolean>>({});

  // Slide ordering / manipulation
  const moveSlide = (index: number, direction: "up" | "down") => {
    const updatedSlides = [...outline.slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updatedSlides.length) return;

    // Swap
    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[targetIndex];
    updatedSlides[targetIndex] = temp;

    onChange({ ...outline, slides: updatedSlides });
    setExpandedIndex(targetIndex);
  };

  const deleteSlide = (index: number) => {
    if (outline.slides.length <= 3) return; // Keep at least 3 slides
    const updatedSlides = outline.slides.filter((_, i) => i !== index);
    onChange({ ...outline, slides: updatedSlides });
    setExpandedIndex(Math.max(0, index - 1));
  };

  const addSlide = () => {
    const newSlide: SlideData = {
      heading: "New Slide Heading",
      bullets: ["Bullet point 1", "Bullet point 2"],
      speakerNotes: "Speaker notes go here.",
      suggestedVisual: "none"
    };
    onChange({
      ...outline,
      slides: [...outline.slides, newSlide]
    });
    setExpandedIndex(outline.slides.length);
  };

  // Change individual slide fields
  const handleSlideChange = (index: number, field: keyof SlideData, val: any) => {
    const updatedSlides = [...outline.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: val
    };
    onChange({ ...outline, slides: updatedSlides });
  };

  const handleBulletChange = (slideIndex: number, bulletIndex: number, text: string) => {
    const updatedSlides = [...outline.slides];
    const updatedBullets = [...updatedSlides[slideIndex].bullets];
    updatedBullets[bulletIndex] = text;
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      bullets: updatedBullets
    };
    onChange({ ...outline, slides: updatedSlides });
  };

  const addBullet = (slideIndex: number) => {
    const updatedSlides = [...outline.slides];
    const updatedBullets = [...updatedSlides[slideIndex].bullets, "New bullet point"];
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      bullets: updatedBullets
    };
    onChange({ ...outline, slides: updatedSlides });
  };

  const removeBullet = (slideIndex: number, bulletIndex: number) => {
    const updatedSlides = [...outline.slides];
    const updatedBullets = updatedSlides[slideIndex].bullets.filter((_, i) => i !== bulletIndex);
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      bullets: updatedBullets
    };
    onChange({ ...outline, slides: updatedSlides });
  };

  const triggerRegen = async (index: number) => {
    setLoadingSlide(prev => ({ ...prev, [index]: true }));
    try {
      await onRegenerateSlide(index, instructions[index] || "");
      setInstructions(prev => ({ ...prev, [index]: "" }));
    } finally {
      setLoadingSlide(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Slide Header Editing */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          Presentation Title
        </label>
        <input
          value={outline.title}
          onChange={(e) => onChange({ ...outline, title: e.target.value })}
          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
          placeholder="Main presentation title..."
        />
      </div>

      {/* Theme Quick Switcher in Config */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          Quick Theme Swap
        </label>
        <select
          value={themeId}
          onChange={(e) => onThemeChange(e.target.value)}
          title="Select theme"
          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
        >
          {PPT_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label} ({theme.pptx.layoutStyle})
            </option>
          ))}
        </select>
      </div>

      {/* Slide Cards Accordion */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">
            Presentation Outline ({outline.slides.length} Slides)
          </label>
          <button
            onClick={addSlide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-purple-500/30 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-[10px] font-black text-purple-400 hover:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </button>
        </div>

        <div className="space-y-2">
          {outline.slides.map((slide, sIdx) => {
            const isExpanded = expandedIndex === sIdx;
            const isFirst = sIdx === 0;
            const isLast = sIdx === outline.slides.length - 1;

            return (
              <div
                key={sIdx}
                className={`border rounded-2xl transition-all ${
                  isExpanded
                    ? "border-purple-500 bg-slate-900/50 shadow-lg"
                    : "border-white/[0.06] bg-slate-950/40 hover:bg-slate-900/20"
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : sIdx)}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-4">
                    <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                      Slide {sIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {slide.heading || "(No Heading)"}
                    </span>
                  </div>

                  {/* Ordering Controls */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={isFirst}
                      onClick={() => moveSlide(sIdx, "up")}
                      title="Move slide up"
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isLast}
                      onClick={() => moveSlide(sIdx, "down")}
                      title="Move slide down"
                      className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={outline.slides.length <= 3}
                      onClick={() => deleteSlide(sIdx)}
                      title="Delete slide"
                      className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-white/[0.06] space-y-4 animate-fade-down">
                    {/* Heading Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">
                        Slide Heading
                      </label>
                      <input
                        value={slide.heading}
                        onChange={(e) => handleSlideChange(sIdx, "heading", e.target.value)}
                        title="Slide Heading"
                        placeholder="Slide Heading"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    {/* Bullets Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-slate-500">
                          Bullet Points
                        </label>
                        <button
                          onClick={() => addBullet(sIdx)}
                          className="text-[9px] font-bold text-purple-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {slide.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-center">
                            <span className="text-purple-500 text-xs shrink-0 select-none">•</span>
                            <input
                              value={bullet}
                              onChange={(e) => handleBulletChange(sIdx, bIdx, e.target.value)}
                              title="Bullet point"
                              placeholder="Bullet point"
                              className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 leading-normal"
                            />
                            <button
                              onClick={() => removeBullet(sIdx, bIdx)}
                              title="Delete bullet point"
                              className="text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speaker Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">
                        Speaker Notes
                      </label>
                      <textarea
                        value={slide.speakerNotes || ""}
                        onChange={(e) => handleSlideChange(sIdx, "speakerNotes", e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-400 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                        placeholder="Speaker notes..."
                      />
                    </div>

                    {/* Slide AI Regeneration */}
                    <div className="pt-3 border-t border-white/[0.04] space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Regenerate this slide</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={instructions[sIdx] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInstructions(prev => ({ ...prev, [sIdx]: val }));
                          }}
                          placeholder="Instructions (e.g. 'make it shorter', 'add technical terms')"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          disabled={loadingSlide[sIdx]}
                          onClick={() => triggerRegen(sIdx)}
                          className="px-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {loadingSlide[sIdx] ? "..." : "Rewrite"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SlideOutlineEditor;
