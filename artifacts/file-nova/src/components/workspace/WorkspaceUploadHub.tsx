import React from "react";
import { useLocation } from "wouter";
import { Upload, Camera, Clipboard, FileQuestion, Shield } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { TOOL_REGISTRY } from "@/lib/toolPlugin";

interface WorkspaceUploadHubProps {
  acceptedTypes: string[];
  maxFiles: number;
  onFilesSelected: (files: File[]) => void;
  accentColor: string;
  detectedType: "pdf" | "image" | "document" | null;
  uploadRecommendations: string[];
}

export function WorkspaceUploadHub({
  acceptedTypes,
  maxFiles,
  onFilesSelected,
  accentColor,
  detectedType,
  uploadRecommendations,
}: WorkspaceUploadHubProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full animate-fade-up">
      <div className="w-full mb-4 flex items-center justify-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
        <Shield className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-bold">100% processed locally in your browser — files never leave your device</span>
      </div>
      <div className="w-full bg-slate-900/40 border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-4">
        <div className="flex justify-center gap-4 text-slate-400 text-xs font-bold mb-2">
          <button title="Upload document" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Upload className="h-4 w-4 text-indigo-400" /> Upload Any File</button>
          <button title="Take photo from camera" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Camera className="h-4 w-4 text-emerald-400" /> Camera</button>
          <button title="Paste image from clipboard" className="flex items-center gap-1 p-2 rounded-xl bg-slate-950/60 border border-white/5 hover:bg-slate-800 transition"><Clipboard className="h-4 w-4 text-sky-400" /> Paste Image</button>
        </div>

        <h2 className="text-sm font-black uppercase tracking-wider text-slate-350">
          Universal Upload Hub
        </h2>
        <p className="text-xs text-slate-500">Drop PDF, JPG, PNG or DOC files here. FileNova will auto-detect formats & recommend tools.</p>

        <FileDropZone
          acceptedTypes={acceptedTypes}
          maxFiles={maxFiles}
          onFilesSelected={onFilesSelected}
          accentColor={accentColor}
        />

        {detectedType && (
          <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl space-y-2 text-left animate-fade-up">
            <div className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
              <FileQuestion className="h-4 w-4" /> Detected {detectedType.toUpperCase()} Format
            </div>
            <p className="text-[11px] text-slate-400">Select a recommended action pipeline to process your file:</p>
            <div className="flex gap-2 flex-wrap pt-1">
              {uploadRecommendations.map(toolId => {
                const toolObj = TOOL_REGISTRY[toolId];
                if (!toolObj) return null;
                return (
                  <button
                    key={toolId}
                    onClick={() => {
                      setLocation(`/${toolId}`);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-white text-[10px] font-black border border-indigo-500/20 transition cursor-pointer"
                  >
                    {toolObj.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
