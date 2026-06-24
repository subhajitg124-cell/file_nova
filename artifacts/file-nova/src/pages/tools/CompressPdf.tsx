import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressPDFWorkspace from "@/tools/pdf/CompressPDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function CompressPdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("pdf");
    store.setOperation("compress");
  }, []);

  if (files.length > 0) {
    return <CompressPDFWorkspace />;
  }

  return <ToolPageLayout slug="compress-pdf" />;
}
