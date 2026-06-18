import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ResizePhotoWorkspace from "@/tools/image/ResizePhotoWorkspace";

export default function ResizeImagePage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("resize");
  }, []);

  return <ResizePhotoWorkspace />;
}
