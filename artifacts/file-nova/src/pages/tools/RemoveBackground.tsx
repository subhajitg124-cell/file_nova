import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function RemoveBackgroundPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("edit");
    store.updateOptions({ operation: "remove_bg" });
  }, []);

  return <ToolPageLayout slug="remove-background" />;
}
