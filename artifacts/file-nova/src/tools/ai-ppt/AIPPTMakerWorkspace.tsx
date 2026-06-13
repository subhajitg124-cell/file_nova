import { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { TopicInputPanel } from "./components/TopicInputPanel";
import { PastedContentPanel } from "./components/PastedContentPanel";
import { ThemeSelector } from "./components/ThemeSelector";
import { ToneSelector } from "./components/ToneSelector";
import { SlideOutlineEditor } from "./components/SlideOutlineEditor";
import { SlidePreview } from "./components/SlidePreview";
import { PPT_THEMES, getThemeById } from "./lib/themes";
import { generatePptx, type OutlineData } from "./lib/pptGenerator";
import { Presentation } from "lucide-react";
import { FileRecord } from "@/store/useFileStore";
import { useSubscription } from "@/hooks/useSubscription";
import { BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";
import { AIToolHeader } from "./components/AIToolHeader";
import { GenerateButton } from "./components/GenerateButton";

type InputMode = "topic" | "paste";
type Step = "input" | "configure" | "outline" | "done";

export function AIPPTMakerWorkspace() {
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<InputMode>("topic");
  const [inputText, setInputText] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [themeId, setThemeId] = useState(PPT_THEMES[0].id);
  const [tone, setTone] = useState<string>("simple");
  const [outline, setOutline] = useState<OutlineData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; size: string } | null>(null);

  const { incrementFeatureUse } = useSubscription();

  // Mock file to bypass ToolWorkspace's empty dropzone check
  const mockFile: FileRecord = {
    id: "ai-ppt-workspace",
    name: "AI Presentation Workspace",
    size: 0,
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  };

  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/ai-ppt/outline`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          mode: inputMode,
          input: inputText,
          slideCount,
          tone,
          audience,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setOutline(data.outline);
      setStep("outline");
      incrementFeatureUse();
      toast.success("Presentation outline generated successfully!");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      toast.error(e.message || "Failed to generate outline.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSlide = async (slideIndex: number, instructions?: string) => {
    if (!outline) return;
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/ai-ppt/regenerate-slide`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: outline.title,
          slideHeading: outline.slides[slideIndex].heading,
          tone,
          instructions,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const updated = { ...outline };
        updated.slides[slideIndex] = data.slide;
        setOutline(updated);
        incrementFeatureUse();
        toast.success(`Slide ${slideIndex + 1} revised!`);
      } else {
        throw new Error(data.error || "Slide update failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to revise slide.");
    }
  };

  const handleDownload = async () => {
    if (!outline) return;
    setIsGenerating(true);
    try {
      const theme = getThemeById(themeId);
      const blob = await generatePptx(outline, theme);
      const url = URL.createObjectURL(blob);
      const name = `${outline.title.replace(/[^a-z0-9]+/gi, "_")}.pptx`;
      const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
      setResult({ url, name, size: `${sizeMb} MB` });
      setStep("done");
    } catch (e: any) {
      toast.error("Failed to build PPTX file.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setInputText("");
    setOutline(null);
    setResult(null);
    setError(null);
  };

  return (
    <ToolWorkspace
      toolName="AI Slide Maker"
      toolDescription="Generate a complete, themed presentation from a topic or your notes"
      toolIcon={<Presentation className="w-5 h-5 text-purple-400" />}
      accentColor="purple"
      isProcessing={isGenerating}
      isReady={step === "outline" && !!outline}
      onProcess={handleDownload}
      onReset={handleReset}
      resultFile={result ? { name: result.name, url: result.url, size: result.size } : null}
      files={[mockFile]}
      onFilesSelected={() => {}}
      acceptedTypes={[]}
      configPanel={
        <div className="space-y-5">
          <AIToolHeader />
          {step === "input" && (
            <>
              <div className="flex gap-2 p-1 bg-slate-950/60 border border-white/5 rounded-2xl">
                <button
                  onClick={() => setInputMode("topic")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    inputMode === "topic"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Just a topic
                </button>
                <button
                  onClick={() => setInputMode("paste")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    inputMode === "paste"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Paste my notes
                </button>
              </div>

              {inputMode === "topic" ? (
                <TopicInputPanel value={inputText} onChange={setInputText} />
              ) : (
                <PastedContentPanel value={inputText} onChange={setInputText} />
              )}

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Audience (optional)
                </label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Class 10 students, B.Tech viva panel"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-white/10
                             bg-slate-950 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                  <span>Number of slides</span>
                  <span className="text-purple-400 font-bold">{slideCount}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  title="Number of slides"
                  className="w-full h-1 mt-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <ToneSelector value={tone} onChange={setTone} />
              <ThemeSelector value={themeId} onChange={setThemeId} />

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/20 rounded-2xl p-3">
                  {error}
                </p>
              )}

              <GenerateButton
                onClick={handleGenerateOutline}
                disabled={isGenerating || inputText.trim().length < 3}
                isGenerating={isGenerating}
                label="Generate Outline ✨"
              />
            </>
          )}

          {step === "outline" && outline && (
            <SlideOutlineEditor
              outline={outline}
              onChange={setOutline}
              onRegenerateSlide={handleRegenerateSlide}
              themeId={themeId}
              onThemeChange={setThemeId}
            />
          )}
        </div>
      }
      previewPanel={
        outline ? (
          <SlidePreview outline={outline} theme={getThemeById(themeId)} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-20 text-center space-y-3">
            <Presentation className="h-10 w-10 text-slate-600 stroke-[1.5] animate-pulse" />
            <span>Your presentation visual deck preview will display here once outline generates.</span>
          </div>
        )
      }
    />
  );
}
export default AIPPTMakerWorkspace;
