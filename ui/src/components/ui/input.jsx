import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-sm border border-border bg-surface-0 px-2.5 text-xs text-txt-1 outline-none transition-colors placeholder:text-txt-3 focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}
