import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressPDFWorkspace from "@/tools/pdf/CompressPDFWorkspace";

export default function CompressPdfForUploadPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("compress");
  }, []);

  return <CompressPDFWorkspace />;
}
