import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ProtectPDFWorkspace from "@/tools/pdf/ProtectPDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function ProtectPdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <ProtectPDFWorkspace />;
  }

  return <ToolPageLayout slug="protect-pdf" />;
}
