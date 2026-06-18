import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import RotatePDFWorkspace from "@/tools/pdf/RotatePDFWorkspace";

export default function RotatePdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  return <RotatePDFWorkspace />;
}
