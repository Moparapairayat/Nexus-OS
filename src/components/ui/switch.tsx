import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, onChange, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label htmlFor={inputId} className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed")}>
        <div className="relative">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-9 rounded-full border border-input bg-muted/60 transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
              className
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:translate-x-4 dark:bg-foreground"
            )}
          />
        </div>
        {label && <span className="text-xs font-medium text-foreground/90">{label}</span>}
      </label>
    );
  }
);
Switch.displayName = "Switch";
