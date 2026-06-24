import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ResizePhotoWorkspace from "@/tools/image/ResizePhotoWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function ResizeImagePage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("resize");
  }, []);

  if (files.length > 0) {
    return <ResizePhotoWorkspace />;
  }

  return <ToolPageLayout slug="resize-image" />;
}
