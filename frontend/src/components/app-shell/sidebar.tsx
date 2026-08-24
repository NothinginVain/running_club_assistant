"use client";

import { Logo } from "@/components/brand/logo";

import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="px-5 py-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
