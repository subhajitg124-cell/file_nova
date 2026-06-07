import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function ResizeImagePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("resize");
  }, []);

  return <ToolPageLayout slug="resize-image" />;
}
