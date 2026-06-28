"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useUiStore } from "@/store/ui-store";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => go(item.href)}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/assets?action=create")}>
            New asset
            <CommandShortcut>A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/sacks?action=create")}>
            New sack
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/invites?action=create")}>
            Invite teammate
            <CommandShortcut>I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
