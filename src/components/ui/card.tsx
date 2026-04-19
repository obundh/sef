import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "cyber-clip border-l-2 border-r-2 border-[var(--primary)] bg-[var(--card)]/90 shadow-panel backdrop-blur relative overflow-hidden",
        "before:absolute before:inset-0 before:border before:border-[var(--border)] before:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-2 border-b border-[var(--border)] bg-[var(--muted)]/50", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-orbitron font-bold text-[var(--primary)] tracking-widest uppercase", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm font-semibold tracking-wider text-[var(--primary)]/70 uppercase", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
