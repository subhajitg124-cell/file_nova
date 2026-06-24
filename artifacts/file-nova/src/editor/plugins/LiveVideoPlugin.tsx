import React from "react";
import { Video } from "lucide-react";
import type { EditorPlugin } from "../types";

const LiveVideoPreview: React.FC<{ file: File | null; config: Record<string, any>; onDone?: (result: Blob) => void; onClose?: () => void }> = ({ file }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Video className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Video Editor</p>
        <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Compress, trim, and convert video files</p>
        {file && (
          <div className="mt-4 max-w-lg overflow-hidden rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <video src={URL.createObjectURL(file)} controls className="max-w-full h-auto rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export const liveVideoPlugin: EditorPlugin = {
  id: "live-video",
  name: "Video Editor",
  sections: [],
  previewComponent: LiveVideoPreview,
  onSave: async (file) => file,
};
