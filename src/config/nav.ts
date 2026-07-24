import { NavigationConfig } from "@/types/nav";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  FileText,
  DollarSign,
  RefreshCw,
  HelpCircle,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  Palette,
  User,
  Key,
  FolderOpen,
  MessageSquare,
  Zap,
  Activity,
} from "lucide-react";

export const navigationConfig: NavigationConfig = {
  admin: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          roles: ["admin"],
        },
        {
          title: "Reports & Analytics",
          href: "/admin/reports",
          icon: BarChart3,
          roles: ["admin"],
          badge: "Live",
        },
      ],
    },
    {
      title: "Client & Services",
      items: [
        {
          title: "Clients",
          href: "/admin/clients",
          icon: Users,
          roles: ["admin"],
          subItems: [
            { title: "All Clients", href: "/admin/clients" },
            { title: "Active Accounts", href: "/admin/clients/active" },
            { title: "Pending Onboarding", href: "/admin/clients/pending", badge: 3 },
          ],
        },
        {
          title: "Services & Subscriptions",
          href: "/admin/services",
          icon: Package,
          roles: ["admin"],
        },
        {
          title: "Renewals & Expirations",
          href: "/admin/renewals",
          icon: RefreshCw,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Billing & Finance",
      items: [
        {
          title: "Billing Overview",
          href: "/admin/billing",
          icon: CreditCard,
          roles: ["admin"],
        },
        {
          title: "Invoices",
          href: "/admin/invoices",
          icon: FileText,
          roles: ["admin"],
        },
        {
          title: "Payments & Gateways",
          href: "/admin/billing/payments",
          icon: DollarSign,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Support & Operations",
      items: [
        {
          title: "Support Tickets",
          href: "/admin/support",
          icon: HelpCircle,
          roles: ["admin"],
          badge: 5,
        },
        {
          title: "Digital Vault",
          href: "/admin/documents",
          icon: FolderOpen,
          roles: ["admin"],
        },
        {
          title: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "System & Governance",
      items: [
        {
          title: "Automation Engine",
          href: "/admin/automation",
          icon: Zap,
          roles: ["admin"],
        },
        {
          title: "Operations Center",
          href: "/admin/operations",
          icon: Activity,
          roles: ["admin"],
        },
        {
          title: "Security Center",
          href: "/admin/security",
          icon: ShieldAlert,
          roles: ["admin"],
        },
        {
          title: "Audit Logs",
          href: "/admin/audit-logs",
          icon: ShieldAlert,
          roles: ["admin"],
        },
        {
          title: "System Settings",
          href: "/admin/settings",
          icon: Settings,
          roles: ["admin"],
        },
      ],
    },
  ],
  client: [
    {
      title: "Portal Overview",
      items: [
        {
          title: "Dashboard",
          href: "/client",
          icon: LayoutDashboard,
          roles: ["client"],
        },
      ],
    },
    {
      title: "My Services",
      items: [
        {
          title: "Active Services",
          href: "/client/services",
          icon: Package,
          roles: ["client"],
        },
        {
          title: "Service Renewals",
          href: "/client/renewals",
          icon: RefreshCw,
          roles: ["client"],
        },
      ],
    },
    {
      title: "Billing & Receipts",
      items: [
        {
          title: "Invoices",
          href: "/client/invoices",
          icon: FileText,
          roles: ["client"],
        },
        {
          title: "Payments History",
          href: "/client/payments",
          icon: CreditCard,
          roles: ["client"],
        },
        {
          title: "Documents",
          href: "/client/documents",
          icon: FolderOpen,
          roles: ["client"],
        },
      ],
    },
    {
      title: "Support & Account",
      items: [
        {
          title: "Support Tickets",
          href: "/client/support",
          icon: MessageSquare,
          roles: ["client"],
          badge: "24/7",
        },
        {
          title: "Notifications",
          href: "/client/notifications",
          icon: Bell,
          roles: ["client"],
          badge: 3,
        },
        {
          title: "My Profile",
          href: "/client/profile",
          icon: User,
          roles: ["client"],
        },
        {
          title: "Password & Security",
          href: "/change-password",
          icon: Key,
          roles: ["client"],
        },
      ],
    },
  ],
};
