import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import SplitPDFWorkspace from "@/tools/pdf/SplitPDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function SplitPdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("split");
  }, []);

  if (files.length > 0) {
    return <SplitPDFWorkspace />;
  }

  return <ToolPageLayout slug="split-pdf" />;
}
