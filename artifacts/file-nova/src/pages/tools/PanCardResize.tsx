import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import PANCardResizeWorkspace from "@/tools/india/PANCardResizeWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function PanCardResizePage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("image");
    store.setOperation("pancard");
  }, []);

  if (files.length > 0) {
    return <PANCardResizeWorkspace />;
  }

  return <ToolPageLayout slug="pan-card-resize" />;
}
