import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import SplitPDFWorkspace from "@/tools/pdf/SplitPDFWorkspace";

export default function SplitPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("split");
  }, []);

  return <SplitPDFWorkspace />;
}
