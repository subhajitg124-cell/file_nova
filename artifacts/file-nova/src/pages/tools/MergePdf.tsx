import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import MergePDFWorkspace from "@/tools/pdf/MergePDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function MergePdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("pdf");
    store.setOperation("merge");
  }, []);

  if (files.length > 0) {
    return <MergePDFWorkspace />;
  }

  return <ToolPageLayout slug="merge-pdf" />;
}
