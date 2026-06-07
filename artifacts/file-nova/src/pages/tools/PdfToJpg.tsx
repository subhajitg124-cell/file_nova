import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function PdfToJpgPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("convert");
    store.updateOptions({ operation: "pdf_to_images" });
  }, []);

  return <ToolPageLayout slug="pdf-to-jpg" />;
}
