import React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  label: React.ReactNode;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({ name, options, value, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => {
        const isChecked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-input p-3 bg-background/40 hover:bg-muted/40 cursor-pointer transition-all",
              isChecked && "border-primary bg-primary/5 ring-1 ring-primary",
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={option.disabled}
              onChange={() => onChange?.(option.value)}
              className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-input cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">{option.label}</span>
              {option.description && (
                <span className="text-[11px] text-muted-foreground mt-0.5">{option.description}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
