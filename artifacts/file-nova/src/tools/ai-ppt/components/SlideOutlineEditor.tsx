import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, RefreshCw, ChevronDown, ChevronUp, FileText, Sparkles } from "lucide-react";
import type { OutlineData, SlideData } from "../lib/pptGenerator";
import { ThemeSelector } from "./ThemeSelector";

interface Props {
  outline: OutlineData;
  onChange: (outline: OutlineData) => void;
  onRegenerateSlide: (index: number, instructions?: string) => Promise<void>;
  themeId: string;
  onThemeChange: (id: string) => void;
}

export function SlideOutlineEditor({ outline, onChange, onRegenerateSlide, themeId, onThemeChange }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, string>>({});

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

  const handleRegenerate = async (index: number) => {
    setRegeneratingIndex(index);
    try {
      await onRegenerateSlide(index, feedback[index] || undefined);
      setFeedback(prev => ({ ...prev, [index]: "" }));
    } finally {
      setRegeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Slide Header Editing */}
      <div className="flex flex-col gap-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            Edit Outline
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            {outline.slides.length} slides
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Presentation Title
          </label>
          <input
            value={outline.title}
            onChange={(e) => onChange({ ...outline, title: e.target.value })}
            title="Presentation Title"
            placeholder="Main presentation title..."
            className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Theme selector in workspace outline edit step */}
      <div className="space-y-3 pb-4 border-b border-border">
        <ThemeSelector value={themeId} onChange={onThemeChange} />
      </div>

      {/* Slide Cards Accordion Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Slides Outline
          </label>
          <button
            onClick={addSlide}
            title="Add a new slide at the end"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 text-[10px] font-black text-purple-600 dark:text-purple-400 hover:text-purple-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </button>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {outline.slides.map((slide, i) => {
            const isExpanded = expandedIndex === i;
            const isRegenerating = regeneratingIndex === i;
            const isFirst = i === 0;
            const isLast = i === outline.slides.length - 1;

            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-200 overflow-hidden
                            ${isExpanded
                              ? "border-purple-300 dark:border-purple-800 shadow-md shadow-purple-500/5"
                              : "border-border hover:border-purple-200 dark:hover:border-purple-900"}`}
              >
                {/* Card Title Bar */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between p-3 bg-muted hover:bg-muted/80 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-900/30 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs font-semibold text-foreground truncate">
                      {slide.heading || "(No Heading)"}
                    </span>
                  </div>

                  {/* Move & Delete controls */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={isFirst}
                      onClick={() => moveSlide(i, "up")}
                      title="Move slide up"
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={isLast}
                      onClick={() => moveSlide(i, "down")}
                      title="Move slide down"
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={outline.slides.length <= 3}
                      onClick={() => deleteSlide(i)}
                      title="Delete slide"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 disabled:opacity-30 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                    )}
                  </div>
                </div>

                {/* Card expanded body */}
                {isExpanded && (
                  <div className="p-4 bg-card border-t border-border space-y-4">
                    {/* Heading Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Slide Heading
                      </label>
                      <input
                        value={slide.heading}
                        onChange={(e) => handleSlideChange(i, "heading", e.target.value)}
                        title="Slide Heading"
                        placeholder="Slide Heading"
                        className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Bullets Input List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Bullet Points
                        </label>
                        <button
                          onClick={() => addBullet(i)}
                          title="Add a new bullet point"
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {slide.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-center">
                            <span className="text-purple-500 text-xs shrink-0 select-none">•</span>
                            <input
                              value={bullet}
                              onChange={(e) => handleBulletChange(i, bIdx, e.target.value)}
                              title={`Bullet point ${bIdx + 1}`}
                              placeholder={`Bullet point ${bIdx + 1}`}
                              className="flex-1 bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-purple-500 leading-normal"
                            />
                            <button
                              onClick={() => removeBullet(i, bIdx)}
                              title="Delete bullet point"
                              className="text-muted-foreground hover:text-rose-500 cursor-pointer shrink-0 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Speaker Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Speaker Notes
                      </label>
                      <textarea
                        value={slide.speakerNotes || ""}
                        onChange={(e) => handleSlideChange(i, "speakerNotes", e.target.value)}
                        rows={2}
                        title="Speaker Notes"
                        placeholder="Speaker notes for this slide..."
                        className="w-full bg-card border border-border rounded-xl p-3 text-xs text-muted-foreground focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Slide AI Regeneration */}
                    <div className="pt-3.5 border-t border-border space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Regenerate this slide</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={feedback[i] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFeedback(prev => ({ ...prev, [i]: val }));
                          }}
                          title="Regenerate instructions"
                          placeholder="e.g. make it shorter, add technical terms"
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-border
                                     bg-card text-foreground focus:outline-none focus:border-purple-500"
                        />
                        <button
                          disabled={isRegenerating}
                          onClick={() => handleRegenerate(i)}
                          title="Redo this slide"
                          className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer
                                     bg-purple-50 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                          Redo
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
}

export default SlideOutlineEditor;
