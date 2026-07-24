export const USER_ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: "/verify-email",
  CALLBACK: "/auth/callback",
} as const;

export const DEFAULT_REDIRECTS = {
  ADMIN: "/admin",
  CLIENT: "/client",
  PUBLIC: "/login",
} as const;

export const AUTH_COOKIE_NAME = "nexusos-auth-token";
