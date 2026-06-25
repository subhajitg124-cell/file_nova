import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { PdfToJpgWorkspace } from "@/tools/image/PdfToJpgWorkspace";

export default function PdfToJpgPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("convert");
    store.updateOptions({ operation: "pdf_to_images" });
  }, []);

  if (files.length > 0) {
    return <PdfToJpgWorkspace />;
  }

  return <ToolPageLayout slug="pdf-to-jpg" />;
}