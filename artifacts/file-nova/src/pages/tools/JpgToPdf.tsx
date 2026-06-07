import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function JpgToPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("convert");
    store.updateOptions({ operation: "images_to_pdf" });
  }, []);

  return <ToolPageLayout slug="jpg-to-pdf" />;
}
