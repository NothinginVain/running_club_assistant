import {
  ClipboardList,
  Heart,
  LayoutDashboard,
  ScrollText,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/survey", label: "Survey", icon: ClipboardList },
  { href: "/plans", label: "Plans", icon: ScrollText },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/profile", label: "Profile", icon: UserRound },
];
