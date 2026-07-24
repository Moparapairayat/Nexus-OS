"use client";

import React from "react";
import { Check } from "lucide-react";

interface SetupStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: { id: number; title: string }[];
}

export function SetupStepper({ currentStep, totalSteps, steps }: SetupStepperProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          Step {currentStep} of {totalSteps}: <span className="text-primary">{steps[currentStep - 1]?.title}</span>
        </span>
        <span className="font-mono">{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
      </div>

      <div className="flex items-center gap-1.5">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                  : isCurrent
                  ? "bg-primary shadow-xs shadow-primary/50 animate-pulse"
                  : "bg-muted/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
