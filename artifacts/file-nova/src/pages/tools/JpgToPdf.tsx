import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { JpgToPdfWorkspace } from "@/tools/image/JpgToPdfWorkspace";

export default function JpgToPdfPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("convert");
    store.updateOptions({ operation: "images_to_pdf" });
  }, []);

  if (files.length > 0) {
    return <JpgToPdfWorkspace />;
  }

  return <ToolPageLayout slug="jpg-to-pdf" />;
}