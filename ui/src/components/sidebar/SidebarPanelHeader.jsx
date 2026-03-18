import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function SidebarPanelHeader({
  badgeLabel,
  CollapseIcon,
  ExpandIcon,
  isOpen,
  onToggle,
  subtitle,
  title,
}) {
  return (
    <div className="grid gap-2 border-b border-border bg-gradient-to-b from-surface-2 to-surface-1 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        {isOpen ? (
          <div className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
              {title}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-txt-3">
              {subtitle}
            </span>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          onClick={onToggle}
          type="button"
          title={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? (
            <CollapseIcon className="h-3.5 w-3.5" />
          ) : (
            <ExpandIcon className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {isOpen ? (
        <Badge className="self-start" tone="accent">
          {badgeLabel}
        </Badge>
      ) : null}
    </div>
  );
}
