import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { WordToPdfWorkspace } from "@/tools/office/WordToPdfWorkspace";

export default function WordToPdfPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("office");
    store.setOperation("convert");
  }, []);

  if (files.length > 0) {
    return <WordToPdfWorkspace />;
  }

  return <ToolPageLayout slug="word-to-pdf" />;
}