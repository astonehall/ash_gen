import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-violet-500/40 bg-violet-600 text-white shadow-[0_0_0_1px_rgba(139,92,246,0.35)] hover:bg-violet-500",
        secondary:
          "border-border-strong bg-surface-2 text-txt-1 hover:bg-surface-3",
        ghost:
          "border-transparent bg-transparent text-txt-2 hover:bg-surface-2 hover:text-txt-1",
        success:
          "border-emerald-500/35 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
        info: "border-sky-500/35 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
