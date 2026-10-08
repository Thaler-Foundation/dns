"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Drawer swipeDirection="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        aria-label="Open menu"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:hidden"
      >
        <Menu className="size-5" />
      </DrawerTrigger>

      <DrawerContent className="w-full max-w-xs rounded-none border-y-0 border-l-0 border-r border-border bg-card p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-card-foreground shadow-none [--drawer-inset:0px]">
        <DrawerHeader className="flex h-14 flex-row items-center justify-between space-y-0 border-b border-border px-4 py-0">
          <DrawerTitle className="text-sm font-semibold text-foreground">Menu</DrawerTitle>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DrawerClose
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <X className="size-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-sm px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
