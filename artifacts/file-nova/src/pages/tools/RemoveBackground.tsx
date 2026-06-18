import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import BGRemoverWorkspace from "@/tools/image/BGRemoverWorkspace";

export default function RemoveBackgroundPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("edit");
  }, []);

  return <BGRemoverWorkspace />;
}
