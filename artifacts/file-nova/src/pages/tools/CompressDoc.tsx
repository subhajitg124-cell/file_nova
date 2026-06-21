import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressDocWorkspace from "@/tools/office/CompressDocWorkspace";

export default function CompressDocPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("office");
    store.setOperation("compress");
  }, []);

  return <CompressDocWorkspace />;
}
