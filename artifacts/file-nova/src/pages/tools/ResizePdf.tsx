import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function ResizePdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("resize");
    store.updateOptions({ operation: "pdf_resize" });
  }, []);

  return <ToolPageLayout slug="resize-pdf" />;
}
