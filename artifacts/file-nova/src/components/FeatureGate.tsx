import React from "react";

interface FeatureGateProps {
  children: React.ReactNode;
  requiredPlan: any;
  featureName: string;
  fallbackMode?: "blur" | "hide";
}

export function FeatureGate({ children }: FeatureGateProps) {
  return <>{children}</>;
}
