import React, { useEffect } from "react";
import { useLocation } from "wouter";

export default function DeveloperWorkspace() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/dev", { replace: true });
  }, [setLocation]);

  return null;
}
