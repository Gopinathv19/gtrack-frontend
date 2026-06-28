import { cn } from "@/lib/utils";
import {
  ASSET_STATUS_COLORS,
  INVITE_STATUS_COLORS,
  SACK_STATUS_COLORS,
} from "@/constants";

interface StatusBadgeProps {
  value: string;
  variant?: "asset" | "sack" | "invite";
  className?: string;
}

export function StatusBadge({ value, variant = "asset", className }: StatusBadgeProps) {
  const map =
    variant === "sack"
      ? SACK_STATUS_COLORS
      : variant === "invite"
        ? INVITE_STATUS_COLORS
        : ASSET_STATUS_COLORS;
  const color = map[value] ?? "bg-muted text-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        color,
        className,
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
