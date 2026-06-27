import React from "react";
import { Settings, FileText } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";

const DefaultSection: React.FC<SectionProps> = ({ file }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <div className="flex flex-col items-center text-center py-6">
        <div className="h-12 w-12 rounded-2xl bg-muted/80 dark:bg-muted flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground/80 dark:text-muted-foreground" />
        </div>
        <p className="text-xs font-bold text-foreground/80 dark:text-foreground/90">Ready to Process</p>
        <p className="text-[10px] text-muted-foreground/80 dark:text-muted-foreground mt-1 max-w-[180px]">
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
