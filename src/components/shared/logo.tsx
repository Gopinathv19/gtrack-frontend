import { Boxes } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Boxes className="size-4" aria-hidden />
      </span>
      {showText && (
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </div>
  );
}
