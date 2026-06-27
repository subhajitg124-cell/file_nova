import React from "react";
import { Camera } from "lucide-react";
import type { EditorPlugin } from "../types";

const PassportPhotoPreview: React.FC<{ file: File | null; config: Record<string, any>; onDone?: (result: Blob) => void; onClose?: () => void }> = ({ file }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className="flex flex-col items-center text-muted-foreground/80 dark:text-muted-foreground">
        <div className="h-16 w-16 rounded-2xl bg-muted/80 dark:bg-muted flex items-center justify-center mb-3">
          <Camera className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold text-muted-foreground dark:text-muted-foreground/80">Passport Photo Editor</p>
        <p className="text-xs mt-1 text-muted-foreground/80 dark:text-muted-foreground">Resize to passport & visa photo sizes</p>
        {file && (
          <div className="mt-4 max-w-sm overflow-hidden rounded-2xl shadow-xl border border-border dark:border-muted">
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export const passportPhotoPlugin: EditorPlugin = {
  id: "passport-photo",
  name: "Passport Photo",
  sections: [],
  previewComponent: PassportPhotoPreview,
  onSave: async (file) => file,
};
