import {
  Boxes,
  Building2,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { ROUTES } from "@/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  group?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard, group: "Workspace" },
  { label: "Assets", href: ROUTES.ASSETS, icon: Package, group: "Operations" },
  { label: "Sacks", href: ROUTES.SACKS, icon: Boxes, group: "Operations" },
  { label: "Locations", href: ROUTES.LOCATIONS, icon: MapPin, group: "Operations" },
  { label: "Instances", href: ROUTES.INSTANCES, icon: Layers, group: "Organization" },
  { label: "Groups", href: ROUTES.GROUPS, icon: Building2, group: "Organization" },
  { label: "Users", href: ROUTES.USERS, icon: Users, group: "Access" },
  { label: "Invites", href: ROUTES.INVITES, icon: UserPlus, group: "Access" },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings, group: "System" },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "Audit Log", href: "/settings#audit", icon: ShieldCheck },
];
