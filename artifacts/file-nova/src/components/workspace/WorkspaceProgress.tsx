import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface WorkspaceProgressProps {
  currentStep: number; // 1: Upload, 2: Configure, 3: Done
}

export const WorkspaceProgress: React.FC<WorkspaceProgressProps> = ({ currentStep }) => {
  const { tText } = useTranslation();

  const steps = [
    { number: 1, label: tText("Upload") },
    { number: 2, label: tText("Configure") },
    { number: 3, label: tText("Done") },
  ];

  return (
    <div className="w-full max-w-sm mx-auto flex items-center justify-between relative px-2 mb-8 select-none">
      {/* Background Track Line */}
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-border -translate-y-1/2 -z-10 rounded-full" />
      
      {/* Active Progress Line Fill */}
      <div
        className="absolute top-1/2 left-4 h-0.5 bg-brand-primary -translate-y-1/2 -z-10 transition-all duration-500 rounded-full"
        style={{
          width:
            currentStep === 1
              ? "0%"
              : currentStep === 2
              ? "50%"
              : "100%",
        }}
      />

      {steps.map((step) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isFuture = currentStep < step.number;

        return (
          <div key={step.number} className="flex flex-col items-center bg-card px-3.5 gap-1.5 z-10">
            <span
              className={`h-7 w-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                isCompleted
                  ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                  : isActive
                  ? "border-brand-primary bg-card text-brand-primary shadow-sm ring-4 ring-brand-primary/10"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : step.number}
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${
                isActive
                  ? "text-brand-primary font-extrabold"
                  : isCompleted
                  ? "text-brand-primary/80"
                  : "text-muted-foreground/75"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WorkspaceProgress;
