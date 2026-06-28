"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  assets: "Assets",
  sacks: "Sacks",
  locations: "Locations",
  users: "Users",
  invites: "Invites",
  instances: "Instances",
  groups: "Groups",
  settings: "Settings",
  onboarding: "Onboarding",
};

function humanize(slug: string) {
  return LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="size-3.5" aria-hidden />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const looksLikeId = /^[0-9a-f-]{8,}$/i.test(seg);
        const label = looksLikeId ? seg.slice(0, 8) : humanize(seg);
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="size-3" aria-hidden />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
