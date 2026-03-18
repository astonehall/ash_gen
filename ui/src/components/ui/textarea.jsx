import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[72px] w-full resize-y rounded-sm border border-border bg-surface-0 px-3 py-2 text-xs text-txt-1 outline-none transition-colors placeholder:text-txt-3 focus:border-accent focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}
