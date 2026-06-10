import React, { useState, useEffect } from "react";
import { 
  FileText, ArrowRight, RotateCw, Trash2, CheckCircle2, 
  Settings2, Sliders, ShieldCheck, Sparkles, Plus, AlertCircle, FileArchive, Table
} from "lucide-react";
import { FileRecord, useFileStore } from "@/store/useFileStore";
import { WorkspaceType } from "@/lib/toolPlugin";

interface WorkspaceProps {
  files: FileRecord[];
  configPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  isProcessing: boolean;
  onReset: () => void;
  onProcess: () => Promise<void>;
  isReady: boolean;
}

// Phase 4: Interactive CSV/Tabular Spreadsheet Previewer
export const SpreadsheetPreviewer: React.FC<{ filename: string }> = ({ filename }) => {
  const [gridData, setGridData] = useState<string[][]>([]);
  const rawFile = useFileStore(state => state.rawFiles.find(rf => rf.name === filename));

  useEffect(() => {
    if (!rawFile) return;

    // Parse top rows of CSV or spreadsheet files
    if (rawFile.name.endsWith(".csv") || rawFile.type.includes("csv") || rawFile.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;
        const rows = text
          .split("\n")
          .slice(0, 6) // Read top 6 rows
          .map(row => row.split(",").map(cell => cell.trim()).slice(0, 6)); // Read top 6 columns
        setGridData(rows.filter(row => row.length > 0 && row[0] !== ""));
      };
      reader.readAsText(rawFile.slice(0, 10000)); // Read first 10KB
    }
  }, [rawFile]);

  if (gridData.length === 0) return null;

  return (
    <div className="w-full bg-slate-900/60 border border-white/[0.08] rounded-3xl p-4 space-y-3 backdrop-blur-xl animate-fade-up">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-400">
        <Table className="h-4 w-4" />
        <span>Spreadsheet Preview Grid: {filename}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
        <table className="w-full text-[10.5px] border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-white/10 text-slate-400 font-black">
              {gridData[0]?.map((_, colIdx) => (
                <th key={colIdx} className="p-2 text-left select-none">Col {colIdx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {gridData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] text-slate-300">
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-2 max-w-[150px] truncate">{cell || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="text-[9px] text-slate-500 block text-center">Displaying first 6 rows and columns. Offline parsing completed successfully.</span>
    </div>
  );
};

// 1. PDF_EDITOR Workspace Layout
export const PdfEditorWorkspace: React.FC<WorkspaceProps> = ({ files, configPanel, previewPanel }) => {
  return (
    <div className="w-full grid grid-cols-1 gap-6">
      <div className="bg-slate-950/40 border border-white/[0.05] rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
          <span>Arrange Documents & Page Ranges</span>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            {files.length} Files loaded
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {files.map((file, idx) => (
            <div key={file.id} className="p-3 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-between h-32 relative group">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Rotate page" className="p-1 rounded bg-slate-950 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"><RotateCw className="h-3 w-3" /></button>
                <button title="Delete page" className="p-1 rounded bg-slate-950 border border-white/10 hover:bg-rose-950 text-slate-450 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>
              </div>

              <div className="h-14 flex items-center justify-center bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-500 font-bold">
                P. {idx + 1}
              </div>
              <div className="text-[10px] font-bold text-slate-350 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full">
        {previewPanel}
      </div>
    </div>
  );
};

// 2. CONVERTER Workspace Layout
export const ConverterWorkspace: React.FC<WorkspaceProps> = ({ files, previewPanel }) => {
  const showSpreadsheet = files.length > 0 && (files[0].name.endsWith(".csv") || files[0].name.endsWith(".xlsx"));

  return (
    <div className="w-full space-y-4">
      {showSpreadsheet && <SpreadsheetPreviewer filename={files[0].name} />}
      <div className="w-full">
        {previewPanel}
      </div>
    </div>
  );
};

// 3. IMAGE Workspace Layout
export const ImageWorkspace: React.FC<WorkspaceProps> = ({ previewPanel }) => {
  return (
    <div className="w-full space-y-4">
      <div className="w-full flex items-center justify-center">
        {previewPanel}
      </div>
    </div>
  );
};

// 4. GOVERNMENT Workspace Layout
export const GovernmentWorkspace: React.FC<WorkspaceProps> = ({ configPanel, previewPanel }) => {
  return (
    <div className="w-full space-y-5">
      <div className="bg-slate-950/40 border border-white/[0.05] rounded-3xl p-4 space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="h-4 w-4" /> Official Compliance Guidelines
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px] font-bold text-slate-400 leading-normal">
          <div className="flex items-start gap-1.5 p-2 bg-slate-900/40 rounded-xl border border-white/[0.02]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>UIDAI Masking: First 8 digits are auto-blanked. Last 4 digits visible.</span>
          </div>
          <div className="flex items-start gap-1.5 p-2 bg-slate-900/40 rounded-xl border border-white/[0.02]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Signature: Draw or upload. White background removed automatically.</span>
          </div>
        </div>
      </div>

      <div className="w-full">
        {previewPanel}
      </div>
    </div>
  );
};

// 5. AI Workspace Layout
export const AiWorkspace: React.FC<WorkspaceProps> = ({ previewPanel }) => {
  return (
    <div className="w-full grid grid-cols-1 gap-4">
      <div className="w-full bg-slate-950/40 border border-white/[0.05] rounded-3xl p-4 flex items-center justify-between text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>AI Context-Aware Extractor</span>
        </div>
        <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
          Active
        </span>
      </div>

      <div className="w-full">
        {previewPanel}
      </div>
    </div>
  );
};

// 6. BATCH Workspace Layout
export const BatchWorkspace: React.FC<WorkspaceProps> = ({ files, configPanel, isProcessing }) => {
  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-950/40 border border-white/[0.05] rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
            <FileArchive className="h-4 w-4 text-indigo-400" />
            Batch processing File Queue
          </h3>
          <span className="text-[10px] font-mono text-slate-500">{files.length} active files</span>
        </div>

        <div className="divide-y divide-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden bg-slate-900/35">
          {files.map((file, idx) => (
            <div key={file.id} className="p-3 flex justify-between items-center text-xs">
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-200 block truncate">{idx + 1}. {file.name}</span>
                <span className="text-[9px] font-mono text-slate-500">Mime: {file.type}</span>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <span className="text-[10px] text-indigo-400 flex items-center gap-1 animate-pulse">
                    <Sparkles className="h-3 w-3 animate-spin" /> processing
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold">Ready</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. UTILITY Workspace Layout
export const UtilityWorkspace: React.FC<WorkspaceProps> = ({ previewPanel }) => {
  return (
    <div className="w-full">
      {previewPanel}
    </div>
  );
};

export const workspaceRegistry = {
  [WorkspaceType.PDF_EDITOR]: PdfEditorWorkspace,
  [WorkspaceType.CONVERTER]: ConverterWorkspace,
  [WorkspaceType.IMAGE]: ImageWorkspace,
  [WorkspaceType.GOVERNMENT]: GovernmentWorkspace,
  [WorkspaceType.AI]: AiWorkspace,
  [WorkspaceType.BATCH]: BatchWorkspace,
  [WorkspaceType.UTILITY]: UtilityWorkspace,
};
