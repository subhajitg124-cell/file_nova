import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useFileStore } from "@/store/useFileStore";
import { TOOLS } from "@/components/workspace/ToolGrid";
import ScholarshipZIPMaker from "@/pages/ScholarshipZIPMaker";
import { Loader2 } from "lucide-react";

interface ToolPageProps {
  params: {
    toolId: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const { toolId } = params;
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if it's the dedicated Scholarship ZIP Maker
    if (toolId === "scholarship-zip" || toolId === "scholarship-zip-maker" || toolId === "scholarship") {
      return;
    }

    setIsRedirecting(true);

    const store = useFileStore.getState();
    store.clearStore();

    // Map common human-readable path slugs to their respective categories, operations and options
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
      setLocation("/workspace");
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
      setLocation("/workspace");
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
      setLocation("/workspace");
    } else if (slug === "pan-card" || slug === "pancard") {
      store.setSelectedSection("image");
      store.setOperation("pancard");
      setLocation("/workspace");
    } else if (slug === "ocr" || slug === "pdf-ocr") {
      store.setSelectedSection("pdf");
      store.setOperation("edit");
      store.updateOptions({ operation: "pdf_ocr" });
      setLocation("/workspace");
    } else if (slug === "zip" || slug === "html-to-zip") {
      store.setSelectedSection("office");
      store.setOperation("convert");
      store.updateOptions({ operation: "html_to_zip" });
      setLocation("/workspace");
    } else {
      // Find matching standard tool in the TOOLS catalog
      const matchedTool = TOOLS.find(t => 
        t.actionName.toLowerCase() === slug ||
        t.actionName.toLowerCase().replace(/_/g, "-") === slug ||
        t.title.toLowerCase().replace(/\s+/g, "-") === slug
      );

      if (matchedTool) {
        store.setSelectedSection(matchedTool.category);
        store.setOperation(matchedTool.id);
        store.updateOptions({ operation: matchedTool.actionName });
        setLocation("/workspace");
      } else {
        // Fallback: just redirect to workspace
        setLocation("/workspace");
      }
    }
  }, [toolId, setLocation]);

  if (toolId === "scholarship-zip" || toolId === "scholarship-zip-maker" || toolId === "scholarship") {
    return <ScholarshipZIPMaker />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center mx-auto">
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-bold">Redirecting to Document Workspace...</p>
          <p className="text-xs text-slate-500 mt-1">Configuring tool settings for {toolId}</p>
        </div>
      </div>
    </div>
  );
}
