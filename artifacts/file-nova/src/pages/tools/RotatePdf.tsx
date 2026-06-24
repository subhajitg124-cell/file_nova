import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import RotatePDFWorkspace from "@/tools/pdf/RotatePDFWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function RotatePdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <RotatePDFWorkspace />;
  }

  return <ToolPageLayout slug="rotate-pdf" />;
}
