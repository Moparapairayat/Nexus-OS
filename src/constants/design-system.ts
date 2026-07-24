import { Variants } from "framer-motion";

export const SPACING_SCALE = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem",  // 48px
} as const;

export const BORDER_RADIUS = {
  sm: "var(--radius)",
  md: "calc(var(--radius) + 2px)",
  lg: "calc(var(--radius) + 4px)",
  full: "9999px",
} as const;

export const MOTION_ANIMATIONS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  } as Variants,

  slideUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  } as Variants,

  slideInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  } as Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  } as Variants,

  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as Variants,

  hoverGlow: {
    rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: {
      scale: 1.02,
      boxShadow: "0px 10px 25px -5px rgba(59, 130, 246, 0.25)",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  } as Variants,
} as const;

export const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  suspended: {
    label: "Suspended",
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
  error: {
    label: "Error",
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
  warning: {
    label: "Warning",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  success: {
    label: "Success",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotColor: "bg-slate-400",
  },
} as const;
