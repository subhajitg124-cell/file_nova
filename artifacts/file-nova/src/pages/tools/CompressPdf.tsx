import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressPDFWorkspace from "@/tools/pdf/CompressPDFWorkspace";

export default function CompressPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("pdf");
    store.setOperation("compress");
  }, []);

  return <CompressPDFWorkspace />;
}
