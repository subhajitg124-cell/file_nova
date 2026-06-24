import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import AadhaarMaskWorkspace from "@/tools/india/AadhaarMaskWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function AadhaarMaskPdfPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <AadhaarMaskWorkspace />;
  }

  return <ToolPageLayout slug="aadhaar-mask-pdf" />;
}
