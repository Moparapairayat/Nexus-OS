"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "./input";

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, value, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={value}
          onChange={onChange}
          error={error}
          className={cn("pl-9 font-mono text-xs", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";
