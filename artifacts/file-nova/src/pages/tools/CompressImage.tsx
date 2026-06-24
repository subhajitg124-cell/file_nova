import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressImageWorkspace from "@/tools/image/CompressImageWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function CompressImagePage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("compress");
  }, []);

  if (files.length > 0) {
    return <CompressImageWorkspace />;
  }

  return <ToolPageLayout slug="compress-image" />;
}
