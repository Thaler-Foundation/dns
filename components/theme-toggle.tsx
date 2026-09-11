"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="min-h-10 shrink-0 text-muted-foreground hover:text-foreground sm:min-h-8"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        <HugeiconsIcon
          icon={isDark ? Sun03Icon : Moon02Icon}
          strokeWidth={1.5}
        />
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
