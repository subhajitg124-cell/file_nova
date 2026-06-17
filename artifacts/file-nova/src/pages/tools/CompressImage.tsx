import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function CompressImagePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("compress");
  }, []);

  return <ToolPageLayout slug="compress-image" />;
}
