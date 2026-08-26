"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authApi } from "@/lib/api";
import { broadcastSessionChanged } from "@/lib/session-sync";

import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";

function initials(name: string | undefined): string {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Header() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      queryClient.clear();
      broadcastSessionChanged();
      router.replace("/login");
    },
  });

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 bg-sidebar text-sidebar-foreground [&_[data-slot=sheet-close]]:text-sidebar-foreground"
          >
            <SheetHeader>
              <SheetTitle className="text-sidebar-foreground">
                <Logo subtitle={null} />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  onNavigate={() => setIsSheetOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Logo subtitle={null} />
      </div>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              aria-label="Account menu"
            />
          }
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {initials(user?.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">
            {user?.full_name ?? "Runner"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href="/profile" className="flex items-center gap-2" />}
          >
            <UserRound className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logoutMutation.mutate()}
            variant="destructive"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
