import React from "react";
import { Sparkles, QrCode, Download } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { PresetChips } from "../components/PresetChips";
import { PremiumButton } from "../components/PremiumButton";
import { HintCard } from "../components/HintCard";

const QrSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, onBusy, disabled }) => {
  const handleGenerate = async () => {
    if (!config.qrPayload?.trim()) { onStatusMessage("Enter text or URL first"); return; }
    onBusy(true);
    onStatusMessage("Generating QR...");
    try {
      const size = config.qrSize === "small" ? 150 : config.qrSize === "large" ? 400 : 250;
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(config.qrPayload)}&size=${size}x${size}`);
      const blob = await response.blob();
      onConfigChange("qrResultUrl", URL.createObjectURL(blob));
      onStatusMessage("QR code generated");
    } catch (err: any) {
      onStatusMessage(err.message || "QR generation failed");
    } finally { onBusy(false); }
  };

  const handleDownload = () => {
    if (!config.qrResultUrl) return;
    const link = document.createElement("a");
    link.href = config.qrResultUrl;
    link.download = "qrcode.png";
    link.click();
    onStatusMessage("QR code downloaded");
  };

  return (
    <div className="space-y-3">
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Content">
          <div className="relative">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" value={config.qrPayload || ""} onChange={(e) => onConfigChange("qrPayload", e.target.value)}
              placeholder="https://example.com or any text"
              className="w-full rounded-xl border-border bg-card pl-8 pr-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" disabled={disabled} />
          </div>
        </SettingRow>
      </BentoCard>

      <BentoCard size="sm" hover={false}>
        <SettingRow label="Size">
          <PresetChips
            chips={[
              { id: "small", label: "Small", description: "150px" },
              { id: "medium", label: "Medium", description: "250px" },
              { id: "large", label: "Large", description: "400px" },
            ]}
            value={config.qrSize || "medium"}
            onChange={(v) => onConfigChange("qrSize", v)}
            disabled={disabled}
          />
        </SettingRow>
      </BentoCard>

      <PremiumButton variant="premium" size="md" icon={<Sparkles className="h-4 w-4" />} onClick={handleGenerate} disabled={disabled} className="w-full">
        Generate QR Code
      </PremiumButton>

      {config.qrResultUrl && (
        <BentoCard size="sm" hover={false} accent="premium">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border-border bg-card p-3 shadow-inner">
              <img src={config.qrResultUrl} alt="QR Code" className="w-32 h-auto" width="150" height="150" />
            </div>
            <PremiumButton variant="primary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleDownload}>
              Download PNG
            </PremiumButton>
          </div>
        </BentoCard>
      )}

      <HintCard>Enter any URL or text to generate a QR code. Works great for links, contact info, and payment UPI IDs.</HintCard>
    </div>
  );
};

export const qrPlugin: EditorPlugin = {
  id: "qr",
  name: "QR Code Generator",
  sections: [
    { id: "qr", label: "QR Code", description: "Generate QR codes instantly", icon: <Sparkles className="h-4 w-4" />, component: QrSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
