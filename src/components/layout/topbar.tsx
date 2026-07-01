"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth, useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { getInitials } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants";

export function Topbar() {
  const { email, name } = useAuth();
  const clear = useAuthStore((s) => s.clear);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const router = useRouter();
  const displayName = name ?? email?.split("@")[0] ?? "User";

  const onLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if it fails server-side, we still log out locally.
    }
    clear();
    toast.success("Signed out");
    router.replace(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur sm:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="hidden flex-1 sm:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 px-2.5 text-muted-foreground sm:inline-flex"
          onClick={() => setCommandOpen(true)}
          aria-label="Open command palette"
        >
          <Search className="size-4" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium md:inline">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Search"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-4" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="User menu"
            >
              <Avatar>
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs font-normal text-muted-foreground">
                  Signed in as
                </span>
                <span className="truncate">{displayName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email ?? "—"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
              <UserIcon className="size-4" />
              Profile & settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
