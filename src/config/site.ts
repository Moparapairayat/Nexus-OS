export const siteConfig = {
  name: "NexusOS",
  description: "Next-Generation Digital Client Portal & Service Management SaaS",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/nexusos",
    github: "https://github.com/nexusos/nexusos",
    docs: "https://docs.nexusos.io",
  },
  company: {
    name: "NexusOS Technologies Inc.",
    supportEmail: "support@nexusos.io",
  },
} as const;

export type SiteConfig = typeof siteConfig;
