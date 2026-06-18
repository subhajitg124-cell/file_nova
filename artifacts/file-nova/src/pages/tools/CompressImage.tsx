import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import CompressImageWorkspace from "@/tools/image/CompressImageWorkspace";

export default function CompressImagePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("compress");
  }, []);

  return <CompressImageWorkspace />;
}
