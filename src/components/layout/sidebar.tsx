"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname() ?? "";

  // Group nav items by their `group` property
  const grouped = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    const k = item.group ?? "Other";
    (acc[k] ??= []).push(item);
    return acc;
  }, {});

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r bg-background/95 backdrop-blur",
        className,
      )}
      aria-label="Primary sidebar"
    >
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 pb-6">
        <nav className="space-y-6 py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t px-5 py-3 text-[11px] text-muted-foreground">
        v0.1 · Built for logistics teams
      </div>
    </aside>
  );
}
