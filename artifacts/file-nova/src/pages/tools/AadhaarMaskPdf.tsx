import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";

export default function AadhaarMaskPdfPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("image");
    store.setOperation("resize");
    store.updateOptions({
      operation: "resize",
      resizeType: "dimensions",
      width: 856,
      height: 540,
      resize_width: 856,
      resize_height: 540,
      resize_lock_aspect: false
    });
  }, []);

  return <ToolPageLayout slug="aadhaar-mask-pdf" />;
}
