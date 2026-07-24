import { STATUS_CONFIG } from "@/constants/design-system";

export type StatusVariant = keyof typeof STATUS_CONFIG;

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "glow"
  | "glass";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type CardVariant = "default" | "glass" | "interactive" | "elevated" | "outline";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";
