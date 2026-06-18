import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ProtectPDFWorkspace from "@/tools/pdf/ProtectPDFWorkspace";

export default function ProtectPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  return <ProtectPDFWorkspace />;
}
