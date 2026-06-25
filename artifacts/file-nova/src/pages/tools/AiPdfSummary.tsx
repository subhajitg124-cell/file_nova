import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { AiPdfSummaryWorkspace } from "@/tools/pdf/AiPdfSummaryWorkspace";

export default function AiPdfSummaryPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
    store.updateOptions({ operation: "pdf_summarize" });
  }, []);

  if (files.length > 0) {
    return <AiPdfSummaryWorkspace />;
  }

  return <ToolPageLayout slug="ai-pdf-summary" />;
}