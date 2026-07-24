import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm font-normal [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg+div]:translate-y-[-2px] [&>svg~*]:pl-7 shadow-xs transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 [&>svg]:text-blue-500",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 [&>svg]:text-emerald-500",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 [&>svg]:text-amber-500",
        destructive: "bg-destructive/10 text-destructive border-destructive/20 [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, variant = "default", title, children, ...props }: AlertProps) {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "warning"
      ? AlertTriangle
      : variant === "destructive"
      ? AlertCircle
      : Info;

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="h-4 w-4" />
      <div>
        {title && <h5 className="mb-1 font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
