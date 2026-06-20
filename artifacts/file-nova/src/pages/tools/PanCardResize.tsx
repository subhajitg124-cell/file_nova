import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import PANCardResizeWorkspace from "@/tools/india/PANCardResizeWorkspace";

export default function PanCardResizePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("image");
    store.setOperation("pancard");
  }, []);

  return <PANCardResizeWorkspace />;
}
