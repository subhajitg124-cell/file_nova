import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText, ArrowRight, Settings2, Sparkles, Plus } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";

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

  const sortFiles = (type: 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'reverse' | 'clear') => {
    if (type === 'clear') {
      handleReset();
      return;
    }

    const pairs = files.map((file, idx) => ({
      fileRecord: file,
      rawFile: rawFiles[idx] || new File([], file.name, { type: file.type })
    }));

    if (type === 'name-asc') {
      pairs.sort((a, b) => a.fileRecord.name.localeCompare(b.fileRecord.name));
    } else if (type === 'name-desc') {
      pairs.sort((a, b) => b.fileRecord.name.localeCompare(a.fileRecord.name));
    } else if (type === 'size-asc') {
      pairs.sort((a, b) => a.fileRecord.size - b.fileRecord.size);
    } else if (type === 'size-desc') {
      pairs.sort((a, b) => b.fileRecord.size - a.fileRecord.size);
    } else if (type === 'reverse') {
      pairs.reverse();
    }

    const nextFiles = pairs.map(p => p.fileRecord);
    const nextRaw = pairs.map(p => p.rawFile);

    useFileStore.setState({ files: nextFiles, rawFiles: nextRaw });
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

      {/* Add More Files & Organise Options */}
      <div className="space-y-2.5 pt-4 border-t border-white/[0.05]">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
          Add & Organise Queue
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Add Files Button */}
          <label className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/20 bg-slate-950/60 hover:bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-305 hover:text-white cursor-pointer transition">
            <Plus className="h-3.5 w-3.5" /> Add PDFs
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                if (list.length > 0) {
                  handleFilesSelected(list);
                }
              }}
              className="hidden"
            />
          </label>

          {/* Sort Dropdown */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                sortFiles(val as any);
                e.target.value = ""; // Reset
              }
            }}
            defaultValue=""
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-355 font-bold focus:outline-none focus:border-violet-500 hover:bg-slate-900 cursor-pointer transition"
            title="Sort files queue"
          >
            <option value="" disabled>⇅ Organise</option>
            <option value="name-asc">Sort Name: A → Z</option>
            <option value="name-desc">Sort Name: Z → A</option>
            <option value="size-asc">Sort Size: Smallest</option>
            <option value="size-desc">Sort Size: Largest</option>
            <option value="reverse">Reverse Order</option>
            <option value="clear">Clear All</option>
          </select>
        </div>
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
