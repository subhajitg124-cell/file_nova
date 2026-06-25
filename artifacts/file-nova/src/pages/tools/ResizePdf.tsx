import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { ResizePdfWorkspace } from "@/tools/pdf/ResizePdfWorkspace";

export default function ResizePdfPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("resize");
    store.updateOptions({ operation: "pdf_resize" });
  }, []);

  if (files.length > 0) {
    return <ResizePdfWorkspace />;
  }

  return <ToolPageLayout slug="resize-pdf" />;
}