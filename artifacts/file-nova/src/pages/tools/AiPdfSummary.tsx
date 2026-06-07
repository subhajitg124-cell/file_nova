import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function AiPdfSummaryPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
    store.updateOptions({ operation: "pdf_summarize" });
  }, []);

  return <ToolPageLayout slug="ai-pdf-summary" />;
}
