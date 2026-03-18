import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, GripVertical } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

export function SidebarSection({
  id,
  icon: Icon,
  title,
  open,
  onOpenChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  children,
}) {
  return (
    <Card
      draggable
      onDragStart={(event) => onDragStart(event, id)}
      onDragOver={(event) => onDragOver(event, id)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "overflow-hidden border-border-strong bg-gradient-to-b from-surface-2 to-surface-1",
        isDragging && "opacity-40",
      )}
    >
      <Collapsible.Root open={open} onOpenChange={onOpenChange}>
        <div className="flex items-center gap-2 border-b border-border/80 bg-surface-2/90 px-2.5 py-2">
          <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-txt-3 hover:text-violet-300 active:cursor-grabbing" />
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-violet-300" />}
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-2">
            {title}
          </span>
          <Collapsible.Trigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-txt-1"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content className="grid gap-3 px-3 py-3">
          {children}
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
}
