import { cn } from "../../lib/utils";

export function Badge({ className, tone = "neutral", ...props }) {
  const toneClasses = {
    neutral: "border-border-strong bg-surface-2 text-txt-2",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
