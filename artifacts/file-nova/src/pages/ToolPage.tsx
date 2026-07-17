import React, { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useFileStore } from "@/store/useFileStore";
import { TOOLS } from "@/components/workspace/ToolGrid";
import { Loader2 } from "lucide-react";
import { apiClient, apiMock } from "@/lib/api";

const ScholarshipZIPMaker = lazy(() => import("@/pages/ScholarshipZIPMaker"));
const Workspace = lazy(() => import("@/pages/Home"));

interface ToolPageProps {
  params: {
    toolId: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const { toolId } = params;
  const [, setLocation] = useLocation();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // If it's the dedicated Scholarship ZIP Maker
    if (toolId === "scholarship-zip" || toolId === "scholarship-zip-maker" || toolId === "scholarship") {
      setIsConfigured(true);
      return;
    }

    setIsConfigured(false);
    const store = useFileStore.getState();
    store.clearStore();

    const slug = toolId.toLowerCase().replace(/_/g, "-");

    if (slug === "aadhaar" || slug === "aadhaar-masking" || slug === "aadhaar-mask") {
      store.setSelectedSection("image");
      store.setOperation("resize");
      store.updateOptions({
        operation: "resize",
        resizeType: "dimensions",
        width: 856,
        height: 540,
        resize_width: 856,
        resize_height: 540,
        resize_lock_aspect: false
      });
    } else if (slug === "passport-photo" || slug === "photo-resize" || slug === "passport") {
      store.setSelectedSection("image");
      store.setOperation("resize");
      store.updateOptions({
        operation: "resize",
        resizeType: "dimensions",
        width: 200,
        height: 230,
        resize_width: 200,
        resize_height: 230,
        resize_lock_aspect: false
      });
    } else if (slug === "signature" || slug === "signature-resize") {
      store.setSelectedSection("image");
      store.setOperation("resize");
      store.updateOptions({
        operation: "resize",
        resizeType: "dimensions",
        width: 280,
        height: 80,
        resize_width: 280,
        resize_height: 80,
        resize_lock_aspect: false
      });
    } else if (slug === "pan-card" || slug === "pancard") {
      store.setSelectedSection("image");
      store.setOperation("pancard");
    } else if (slug === "ocr" || slug === "pdf-ocr") {
      store.setSelectedSection("pdf");
      store.setOperation("edit");
      store.updateOptions({ operation: "pdf_ocr" });
    } else if (slug === "zip" || slug === "html-to-zip") {
      store.setSelectedSection("office");
      store.setOperation("convert");
      store.updateOptions({ operation: "html_to_zip" });
    } else {
      const matchedTool = TOOLS.find(t => 
        t.actionName.toLowerCase() === slug ||
        t.actionName.toLowerCase().replace(/_/g, "-") === slug ||
        t.title.toLowerCase().replace(/\s+/g, "-") === slug
      );

      if (matchedTool) {
        store.setSelectedSection(matchedTool.category);
        store.setOperation(matchedTool.id);
        store.updateOptions({ operation: matchedTool.actionName });
      } else {
        // Fallback: render workspace generally
        store.setSelectedSection(null);
      }
    }

    // Check for a preloaded/dropped file in history state
    const droppedFile = window.history.state?.droppedFile;
    if (droppedFile) {
      window.history.replaceState(null, "");
      (async () => {
        store.addRawFiles([droppedFile]);
        const activeJobId = Math.random().toString(36).substring(2, 15);
        store.setJobId(activeJobId);
        store.setProcessing(true);
        try {
          const isMock = store.isMockMode;
          const uploaded = isMock
            ? await apiMock.uploadFiles([droppedFile], activeJobId)
            : await apiClient.uploadFiles([droppedFile], activeJobId);
          store.addFiles(uploaded);
        } catch (err: any) {
          store.setError(err.message || 'Preload upload failed.');
        } finally {
          store.setProcessing(false);
        }
      })();
    }

    setIsConfigured(true);

  }, [toolId]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center mx-auto">
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold">Configuring workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === "scholarship-zip" || toolId === "scholarship-zip-maker" || toolId === "scholarship") {
    return <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin" />}><ScholarshipZIPMaker /></Suspense>;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center mx-auto">
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold">Loading workspace...</p>
          </div>
        </div>
      </div>
    }>
      <Workspace />
    </Suspense>
  );
}
