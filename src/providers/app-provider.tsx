"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";
import { ModalProvider } from "./modal-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ id: "nexus-theme-script" }}
    >
      <AuthProvider>
        <ModalProvider>
          {children}
          <ToastProvider />
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
