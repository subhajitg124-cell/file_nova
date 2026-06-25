import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { PdfToWordWorkspace } from "@/tools/office/PdfToWordWorkspace";

export default function PdfToWordPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("convert");
    store.updateOptions({ operation: "pdf_to_docx" });
  }, []);

  if (files.length > 0) {
    return <PdfToWordWorkspace />;
  }

  return <ToolPageLayout slug="pdf-to-word" />;
}