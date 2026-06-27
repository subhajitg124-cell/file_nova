import React from "react";
import { Video } from "lucide-react";
import type { EditorPlugin } from "../types";

const LiveVideoPreview: React.FC<{ file: File | null; config: Record<string, any>; onDone?: (result: Blob) => void; onClose?: () => void }> = ({ file }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className="flex flex-col items-center text-muted-foreground/80 dark:text-muted-foreground">
        <div className="h-16 w-16 rounded-2xl bg-muted/80 dark:bg-muted flex items-center justify-center mb-3">
          <Video className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold text-muted-foreground dark:text-muted-foreground/80">Video Editor</p>
        <p className="text-xs mt-1 text-muted-foreground/80 dark:text-muted-foreground">Compress, trim, and convert video files</p>
        {file && (
          <div className="mt-4 max-w-lg overflow-hidden rounded-2xl shadow-xl border border-border dark:border-muted">
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
