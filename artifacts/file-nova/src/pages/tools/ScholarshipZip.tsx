import React, { useEffect } from "react";
import { useFileStore } from "@/store/useFileStore";
import ScholarshipZIPWorkspace from "@/tools/india/ScholarshipZIPWorkspace";

export default function ScholarshipZipPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("office");
    store.setOperation("convert");
  }, []);

  return <ScholarshipZIPWorkspace />;
}
