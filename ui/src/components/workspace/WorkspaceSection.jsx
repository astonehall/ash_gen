import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

export function WorkspaceSection({
  id,
  title,
  subtitle,
  icon: Icon,
  badgeTone,
  badgeLabel,
  draggable = true,
  wrapperClassName,
  wrapperStyle,
  cardClassName,
  contentClassName,
  children,
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...wrapperStyle }}
      className={cn("w-full self-stretch", wrapperClassName)}
    >
      <Card
        className={cn(
          "h-full w-full overflow-hidden border-border-strong bg-surface-1/90 transition-opacity",
          isDragging && "opacity-40 shadow-[0_14px_32px_rgba(0,0,0,0.35)]",
          cardClassName,
        )}
      >
        <CardHeader className="border-b border-border bg-surface-2/65 px-3 py-2">
          <div className="flex items-center gap-2">
            {draggable ? (
              <button
                ref={setActivatorNodeRef}
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-violet-300 active:cursor-grabbing"
                {...attributes}
                {...listeners}
                title="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5 cursor-grab" />
              </button>
            ) : (
              <span className="block h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-violet-500/12 text-violet-200">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="grid gap-0.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-2">
                {title}
              </h2>
              <span className="text-xs text-txt-3">{subtitle}</span>
            </div>
          </div>
          <Badge tone={badgeTone}>{badgeLabel}</Badge>
        </CardHeader>
        <CardContent className={cn("w-full p-3", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
