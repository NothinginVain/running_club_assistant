"use client";

import { Footprints } from "lucide-react";

import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Footprints className="size-5" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight">
          Running Club Assistant
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
