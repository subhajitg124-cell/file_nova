import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import PANCardResizeWorkspace from "@/tools/india/PANCardResizeWorkspace";

export default function PanCardResizePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("pancard");
  }, []);

  return <PANCardResizeWorkspace />;
}
