import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import UnlockPDFWorkspace from "@/tools/pdf/UnlockPDFWorkspace";

export default function UnlockPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  return <UnlockPDFWorkspace />;
}
