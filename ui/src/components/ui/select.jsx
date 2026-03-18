import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-8 w-full appearance-none rounded-sm border border-border bg-surface-0 px-2.5 pr-8 text-xs text-txt-1 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-txt-3" />
    </div>
  );
}
