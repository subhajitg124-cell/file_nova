import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ScholarshipZIPWorkspace from "@/tools/india/ScholarshipZIPWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function ScholarshipZipPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    if (!window.history.state?.droppedFile) {
      store.clearStore();
    }
    store.setSelectedSection("office");
    store.setOperation("convert");
  }, []);

  if (files.length > 0) {
    return <ScholarshipZIPWorkspace />;
  }

  return <ToolPageLayout slug="scholarship-zip" />;
}
