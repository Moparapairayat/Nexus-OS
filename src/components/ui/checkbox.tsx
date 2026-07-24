import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded-md border border-input bg-background/50 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 flex items-center justify-center shadow-xs",
              className
            )}
          >
            <Check className="h-3 w-3 opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>
        {label && <span className="text-xs text-foreground/90 font-medium">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
