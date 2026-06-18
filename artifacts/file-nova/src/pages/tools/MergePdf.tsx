import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import MergePDFWorkspace from "@/tools/pdf/MergePDFWorkspace";

export default function MergePdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("merge");
  }, []);

  return <MergePDFWorkspace />;
}
