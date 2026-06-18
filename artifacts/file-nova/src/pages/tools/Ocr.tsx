import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import OCRScanWorkspace from "@/tools/ocr/OCRScanWorkspace";

export default function OcrPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  return <OCRScanWorkspace />;
}
