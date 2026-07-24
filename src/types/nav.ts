import { UserRole } from "@/constants/auth";
import { LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: UserRole[];
  disabled?: boolean;
  external?: boolean;
  subItems?: NavSubItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface NavigationConfig {
  admin: NavSection[];
  client: NavSection[];
}
