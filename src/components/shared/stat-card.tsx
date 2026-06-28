import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden />
            </div>
          )}
        </div>
        {trend && (
          <p
            className={cn(
              "mt-3 text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
