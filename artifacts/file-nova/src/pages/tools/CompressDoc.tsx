import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressDocWorkspace from "@/tools/office/CompressDocWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function CompressDocPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("office");
    store.setOperation("compress");
  }, []);

  if (files.length > 0) {
    return <CompressDocWorkspace />;
  }

  return <ToolPageLayout slug="compress-doc" />;
}
