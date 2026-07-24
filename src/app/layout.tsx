import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AppProvider } from "@/providers/app-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary"
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
