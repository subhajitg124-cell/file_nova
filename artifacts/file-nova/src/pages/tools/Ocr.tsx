import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import OCRScanWorkspace from "@/tools/ocr/OCRScanWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function OcrPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <OCRScanWorkspace />;
  }

  return <ToolPageLayout slug="ocr" />;
}
