import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("tracking-tight font-sans text-foreground", {
  variants: {
    variant: {
      display: "text-4xl md:text-5xl font-extrabold tracking-tighter leading-none",
      h1: "text-3xl md:text-4xl font-bold tracking-tight",
      h2: "text-2xl md:text-3xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold tracking-tight",
      h4: "text-lg font-semibold tracking-tight",
      title: "text-base font-semibold text-foreground",
      subtitle: "text-sm font-medium text-muted-foreground",
      body: "text-sm font-normal text-foreground/90 leading-relaxed",
      caption: "text-xs font-normal text-muted-foreground",
      label: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
      helper: "text-xs font-normal text-muted-foreground",
      error: "text-xs font-medium text-destructive",
      code: "font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 text-foreground",
      numeric: "font-mono text-sm tracking-normal font-medium tabular-nums",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export function Typography({
  className,
  variant = "body",
  as,
  children,
  ...props
}: TypographyProps) {
  let Component: React.ElementType = "p";

  if (as) {
    Component = as;
  } else {
    switch (variant) {
      case "display":
      case "h1":
        Component = "h1";
        break;
      case "h2":
        Component = "h2";
        break;
      case "h3":
        Component = "h3";
        break;
      case "h4":
        Component = "h4";
        break;
      case "title":
      case "subtitle":
        Component = "div";
        break;
      case "label":
        Component = "label";
        break;
      case "code":
        Component = "code";
        break;
      case "error":
      case "helper":
      case "caption":
        Component = "span";
        break;
      default:
        Component = "p";
    }
  }

  return (
    <Component className={cn(typographyVariants({ variant }), className)} {...props}>
      {children}
    </Component>
  );
}
