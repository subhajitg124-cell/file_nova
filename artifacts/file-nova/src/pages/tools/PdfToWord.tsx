import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function PdfToWordPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("convert");
    store.updateOptions({ operation: "pdf_to_docx" });
  }, []);

  return <ToolPageLayout slug="pdf-to-word" />;
}
