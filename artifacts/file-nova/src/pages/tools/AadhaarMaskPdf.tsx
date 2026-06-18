import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import AadhaarMaskWorkspace from "@/tools/india/AadhaarMaskWorkspace";

export default function AadhaarMaskPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  return <AadhaarMaskWorkspace />;
}
