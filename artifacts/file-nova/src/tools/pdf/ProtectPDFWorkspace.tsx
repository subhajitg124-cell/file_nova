import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const ProtectPDFWorkspace: React.FC = () => {
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
  } = useToolProcessor("protect-pdf", "protect");

  // Local configurations
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
  const [encryption, setEncryption] = useState<"128" | "256">("256");

  const getPasswordStrength = () => {
    if (!password) return { label: "Empty", color: "text-muted-foreground bg-muted" };
    if (password.length < 6) return { label: "Weak", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (password.length < 10) return { label: "Moderate", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Strong", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const isReady = files.length > 0 && password.length > 0 && password === confirmPassword;

  const handleProcess = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const options = {
      password,
      allowPrint,
      allowCopy,
      allowEdit,
      encryption,
    };
    await runProcessing(options);
  };

  const strength = getPasswordStrength();

  const configPanel = (
    <div className="space-y-6">
      {/* Password and verify */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">PDF Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-card border border-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/80 cursor-pointer"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength tag */}
          <div className="flex justify-between items-center mt-1">
            <span className="text-[9px] text-muted-foreground font-medium">Min. 6 characters</span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${strength.color}`}>
              {strength.label}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Permissions toggles checkboxes */}
      <div className="space-y-3.5 pt-4 border-t border-border/50">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Restrict Document Permissions
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-foreground/80">
          <input
            type="checkbox"
            checked={allowPrint}
            onChange={(e) => setAllowPrint(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
          />
          <span>Allow printing document page copies</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-foreground/80">
          <input
            type="checkbox"
            checked={allowCopy}
            onChange={(e) => setAllowCopy(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
          />
          <span>Allow copying text layouts and assets</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-foreground/80">
          <input
            type="checkbox"
            checked={allowEdit}
            onChange={(e) => setAllowEdit(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
          />
          <span>Allow modifying document fields (Form Fill)</span>
        </label>
      </div>

      {/* Encryption level radios */}
      <div className="space-y-2 pt-3">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Encryption Standard</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              checked={encryption === "128"}
              onChange={() => setEncryption("128")}
              className="text-primary"
            />
            <span>128-bit AES (Faster load)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              checked={encryption === "256"}
              onChange={() => setEncryption("256")}
              className="text-primary"
            />
            <span>256-bit AES (Stronger shield)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="protect-pdf" />
  );

  return (
    <ToolWorkspace
      toolName="Protect PDF"
      toolDescription="Encrypt your PDF files with high strength password keys and enforce printing and copy limits."
      toolIcon={<Lock className="h-5 w-5" />}
      accentColor="red"
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
export default ProtectPDFWorkspace;
