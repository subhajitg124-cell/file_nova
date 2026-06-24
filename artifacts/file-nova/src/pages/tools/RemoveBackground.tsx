import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import BGRemoverWorkspace from "@/tools/image/BGRemoverWorkspace";
import { ToolPageLayout } from "@/components/ToolPageLayout";

export default function RemoveBackgroundPage() {
  const { files } = useFileStore();

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <BGRemoverWorkspace />;
  }

  return <ToolPageLayout slug="remove-background" />;
}
