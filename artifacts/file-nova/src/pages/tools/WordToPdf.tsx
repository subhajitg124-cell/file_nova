import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function WordToPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("office");
    store.setOperation("convert");
  }, []);

  return <ToolPageLayout slug="pdf-to-word" />;
}
