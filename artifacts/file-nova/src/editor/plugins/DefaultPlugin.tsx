import React from "react";
import { Settings, FileText } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";

const DefaultSection: React.FC<SectionProps> = ({ file }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <div className="flex flex-col items-center text-center py-6">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Ready to Process</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
          {file ? "Click Done to save your changes." : "Upload a file to get started."}
        </p>
      </div>
    </BentoCard>
  </div>
);

export const defaultPlugin: EditorPlugin = {
  id: "default",
  name: "Editor",
  sections: [
    { id: "default", label: "Settings", description: "General options", icon: <Settings className="h-4 w-4" />, component: DefaultSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
