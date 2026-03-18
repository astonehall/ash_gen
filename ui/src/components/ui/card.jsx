import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-surface-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 p-3", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-3 pt-0", className)} {...props} />;
}
