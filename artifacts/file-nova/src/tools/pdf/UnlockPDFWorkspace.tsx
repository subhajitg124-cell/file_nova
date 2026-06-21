import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { LockKeyhole, Eye, EyeOff, ShieldAlert } from "lucide-react";

export const UnlockPDFWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    isUploading,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("unlock-pdf", "unlock");

  // Local configurations
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    const options = {
      password: password || undefined,
    };
    await runProcessing(options);
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Password input */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">PDF Password (if encrypted)</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter decrypt password"
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-pink-505 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Security alert info */}
      <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex gap-2.5 text-xs text-slate-400 leading-relaxed font-medium">
        <ShieldAlert className="h-4.5 w-4.5 text-pink-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-300">Important Decryption Notice</p>
          <p className="text-[10px] text-slate-400">
            FileNova does not perform force decryption on password locks. You must supply the correct password to strip permissions limits and lock headers.
          </p>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="text-center py-6">
      <LockKeyhole className="h-10 w-10 text-pink-400 mx-auto mb-2 animate-pulse" />
      <p className="text-xs font-bold text-slate-200">Locked PDF Document</p>
      <p className="text-[10px] text-slate-500 mt-1">Upload encrypted files. Previews are hidden until decrypted.</p>
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Unlock PDF"
      toolDescription="Decrypt your secured PDF files and remove all passwords, printing, and modification boundaries."
      toolIcon={<LockKeyhole className="h-5 w-5" />}
      accentColor="pink"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={1}
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};
export default UnlockPDFWorkspace;
