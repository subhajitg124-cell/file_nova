import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import UnlockPDFWorkspace from "@/tools/pdf/UnlockPDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function UnlockPdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <UnlockPDFWorkspace />;
  }

  return <ToolPageLayout slug="unlock-pdf" />;
}
