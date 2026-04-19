import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center cyber-clip border-l-[3px] border-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)]",
        className
      )}
      {...props}
    />
  );
}
