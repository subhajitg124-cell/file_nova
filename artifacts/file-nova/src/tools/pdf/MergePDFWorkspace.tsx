import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText, ArrowRight, Settings2, Sparkles } from "lucide-react";

export const MergePDFWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("merge-pdf", "merge");

  // Local configurations
  const [outputName, setOutputName] = useState("merged.pdf");
  const [pageRanges, setPageRanges] = useState<Record<string, string>>({});
  const [applyRanges, setApplyRanges] = useState<Record<string, boolean>>({});

  const isReady = files.length >= 2; // Needs at least 2 files to merge

  const handleProcess = async () => {
    // Generate ranges map if checkbox is ticked
    const ranges = files.map((f) => {
      if (applyRanges[f.id] && pageRanges[f.id]) {
        return pageRanges[f.id];
      }
      return "all";
    });

    const options = {
      outputName: outputName.endsWith(".pdf") ? outputName : `${outputName}.pdf`,
      pageRanges: ranges,
    };
    await runProcessing(options);
  };

  const handleRangeChange = (id: string, value: string) => {
    setPageRanges((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggleRange = (id: string, checked: boolean) => {
    setApplyRanges((prev) => ({ ...prev, [id]: checked }));
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Output Filename */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Output Filename</label>
        <input
          type="text"
          value={outputName}
          onChange={(e) => setOutputName(e.target.value)}
          placeholder="merged.pdf"
          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
        />
      </div>

      {/* Pages constraints per file */}
      <div className="space-y-4 pt-4 border-t border-white/[0.05]">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Settings2 className="h-3.5 w-3.5 text-violet-400" />
          Page Selection Per File (Optional)
        </label>
        
        {files.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-medium">Upload PDF files to configure ranges.</p>
        ) : (
          <div className="space-y-3">
            {files.map((file, idx) => (
              <div key={file.id} className="p-3 rounded-xl border border-white/[0.05] bg-slate-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 truncate max-w-[200px]">
                    {idx + 1}. {file.name}
                  </span>
                  
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-400">
                    <input
                      type="checkbox"
                      checked={!!applyRanges[file.id]}
                      onChange={(e) => handleToggleRange(file.id, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/10 text-violet-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Custom Range</span>
                  </label>
                </div>

                {applyRanges[file.id] && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={pageRanges[file.id] || ""}
                      onChange={(e) => handleRangeChange(file.id, e.target.value)}
                      placeholder="e.g. 1-3, 5"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex items-center gap-2.5 text-xs font-medium text-slate-400">
        <span>💡</span>
        <p className="leading-relaxed">
          Arrange files by clicking the arrows. The first file in the list will be at the beginning of the merged PDF.
        </p>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="space-y-4">
      <PreviewPanel files={rawFiles} slug="merge-pdf" />
      {files.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Files in merge pipeline:</span>
          {files.map((file, idx) => (
            <React.Fragment key={file.id}>
              {idx > 0 && <ArrowRight className="h-3 w-3" />}
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5 font-mono text-slate-300">
                P{idx + 1} ({file.name.substring(0, 8)})
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Merge PDF"
      toolDescription="Combine multiple PDF files into one document in your preferred order."
      toolIcon={<FileText className="h-5 w-5" />}
      accentColor="violet"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={15}
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};
export default MergePDFWorkspace;
