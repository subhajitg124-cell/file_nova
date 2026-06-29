import React from "react";
import { RefreshCw, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ToolWorkspaceProps } from "./ToolWorkspace";
import { COMPLIANCE_TIPS } from "./ToolWorkspace";

interface WorkspaceFooterProps {
  isProcessing: boolean;
  progress: number;
  resultFile: ToolWorkspaceProps["resultFile"];
  tipIndex: number;
  onReset: () => void;
  onProcess: () => void;
  isReady: boolean;
  isOnline: boolean;
  offlineReady: boolean;
  theme: { gradient: string };
  toolName: string;
}

export function WorkspaceFooter({
  isProcessing,
  progress,
  resultFile,
  tipIndex,
  onReset,
  onProcess,
  isReady,
  isOnline,
  offlineReady,
  theme,
  toolName,
}: WorkspaceFooterProps) {
  const renderPrimaryActionButton = () => {
    if (isProcessing) {
      return (
        <div className="space-y-1.5 w-full">
          <Progress value={progress} className="h-1.5 bg-muted" />
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
        </div>
      );
    }

    if (resultFile) {
      return (
        <button
          onClick={onReset}
          className="w-full py-2.5 px-3 text-[10px] bg-muted hover:bg-muted/80 border border-border text-foreground rounded-xl font-black uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Clear Results
        </button>
      );
    }

    return (
      <div className="flex gap-2 w-full font-sans">
        <button
          onClick={onReset}
          className="flex-1 py-2.5 px-3 text-[10px] border border-border rounded-xl font-black uppercase text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={onProcess}
          disabled={!isReady || (!isOnline && !offlineReady)}
          className={`flex-[2] py-2.5 px-3 text-[10px] rounded-xl font-black uppercase tracking-wider text-primary-foreground shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            isReady && (isOnline || offlineReady)
              ? `bg-gradient-to-r ${theme.gradient} hover:scale-[1.01] active:scale-99`
              : "opacity-45 bg-muted text-muted-foreground cursor-not-allowed border border-border"
          }`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Process Queue</span>
        </button>
      </div>
    );
  };

  return (
    <footer className="h-auto md:h-28 bg-background border-t border-border flex flex-col md:grid md:grid-cols-12 z-30 sticky bottom-0">
      <div className="hidden md:flex md:col-span-8 border-r border-border p-3 flex-col overflow-y-auto">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 mb-1">Timeline Ticker Logs</span>
        <div className="font-mono text-[9px] text-muted-foreground">
          <span className="text-primary truncate block">
            💡 {COMPLIANCE_TIPS[tipIndex]}
          </span>
        </div>
      </div>

      <div className="col-span-12 md:col-span-4 p-3 flex flex-col justify-between gap-2.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/80">
            <span>Operational Health</span>
            <span className="text-emerald-400">99.8% Online</span>
          </div>

          <div className="text-[9.5px] font-bold text-primary truncate block">
            💡 {COMPLIANCE_TIPS[tipIndex]}
          </div>
        </div>

        {renderPrimaryActionButton()}
      </div>
    </footer>
  );
}