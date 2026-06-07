import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function ScholarshipZipPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("office");
    store.setOperation("convert");
    store.updateOptions({ operation: "docx_to_pdf" });
  }, []);

  return <ToolPageLayout slug="scholarship-zip" />;
}
