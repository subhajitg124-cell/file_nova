import React from "react";
import { Settings } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const DefaultSection: React.FC<SectionProps> = ({ file, disabled }) => (
  <div className="space-y-4">
    <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center">
      <p className="text-xs text-slate-400">No additional settings for this tool.</p>
      <p className="text-[10px] text-slate-500 mt-2">Click Done to save your file.</p>
    </div>
  </div>
);

export const defaultPlugin: EditorPlugin = {
  id: "default",
  name: "Editor",
  sections: [
    { id: "default", label: "Settings", icon: <Settings className="h-4 w-4" />, component: DefaultSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
