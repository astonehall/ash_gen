import { useRef, useState } from "react";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HeartPulse,
  Settings2,
  Wrench,
} from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

function InfoRow({ label, value, tone = "neutral" }) {
  return (
    <div className="grid justify-items-start gap-1.5 rounded-sm border border-border bg-surface-0 px-2.5 py-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-txt-3">
        {label}
      </span>
      <Badge
        className="max-w-full text-left normal-case tracking-[0.08em]"
        tone={tone}
      >
        {value}
      </Badge>
    </div>
  );
}

function getResizerClassName(isOpen) {
  const base =
    "relative w-1.5 min-h-0 bg-surface-0 max-[900px]:hidden before:absolute before:inset-y-0 before:left-[2px] before:right-[2px] before:transition-colors";
  return isOpen
    ? `${base} cursor-col-resize before:bg-border hover:before:bg-accent`
    : `${base} cursor-default before:bg-surface-2`;
}

export function OptionsSidebar({
  collapsedRailWidth,
  generation,
  health,
  isOpen,
  modelInfo,
  onHealthCheck,
  onModelInfo,
  onResizeStart,
  onToggle,
  statusMessage,
  width,
}) {
  const [sectionOrder, setSectionOrder] = useLocalStorageState(
    "ashgen:options:section-order",
    ["tools", "debug"],
    (value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((item) => ["tools", "debug"].includes(item)),
  );
  const [openSections, setOpenSections] = useLocalStorageState(
    "ashgen:options:open-sections",
    {
      tools: true,
      debug: true,
    },
    (value) =>
      Boolean(value) &&
      typeof value === "object" &&
      typeof value.tools === "boolean" &&
      typeof value.debug === "boolean",
  );
  const [draggingId, setDraggingId] = useState(null);
  const draggingRef = useRef(null);

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDragStart = (e, id) => {
    draggingRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggingRef.current) {
      setSectionOrder((prev) => {
        const next = [...prev];
        const from = next.indexOf(draggingRef.current);
        const to = next.indexOf(id);
        if (from === -1 || to === -1) return prev;
        next.splice(from, 1);
        next.splice(to, 0, draggingRef.current);
        return next;
      });
    }
  };

  const handleDrop = (e) => e.preventDefault();

  const handleDragEnd = () => {
    draggingRef.current = null;
    setDraggingId(null);
  };

  const sectionMeta = {
    tools: { icon: Wrench, label: "Tools" },
    debug: { icon: Bug, label: "Debug" },
  };

  const sectionContent = {
    tools: (
      <Card className="border-dashed border-violet-500/20 bg-violet-500/5">
        <CardContent className="grid place-items-center gap-2 p-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-violet-500/12 text-violet-200">
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium text-txt-1">
              Future tool dock
            </span>
            <span className="text-xs text-txt-3">
              Batch, upscale, masking, and presets will live here.
            </span>
          </div>
        </CardContent>
      </Card>
    ),
    debug: (
      <div className="grid gap-3">
        <div className="grid gap-1">
          <InfoRow label="Status" value={statusMessage} tone="accent" />
          <InfoRow
            label="Backend"
            value={health?.status === "ok" ? "Online" : "Offline"}
            tone={health?.status === "ok" ? "success" : "error"}
          />
          <InfoRow
            label="Model"
            value={
              modelInfo?.model_checkpoint || modelInfo?.model_id || "Not loaded"
            }
            tone="accent"
          />
          <InfoRow
            label="Device"
            value={modelInfo?.resolved_device || "Unknown"}
            tone="neutral"
          />
          <InfoRow
            label="Last Result"
            value={generation?.image_id || "None"}
            tone="neutral"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 max-[1180px]:grid-cols-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onHealthCheck}
            type="button"
            className="w-full justify-start"
          >
            <HeartPulse className="h-3.5 w-3.5" />
            Refresh Health
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onModelInfo}
            type="button"
            className="w-full justify-start"
          >
            <Cpu className="h-3.5 w-3.5" />
            Refresh Model
          </Button>
        </div>

        <pre className="max-h-[220px] overflow-auto rounded-sm border border-border bg-surface-0 p-2 text-left text-2xs leading-relaxed text-txt-2">
          {JSON.stringify(
            { statusMessage, health, modelInfo, generation },
            null,
            2,
          )}
        </pre>
      </div>
    ),
  };

  return (
    <>
      <div
        aria-hidden="true"
        className={getResizerClassName(isOpen)}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />

      <aside
        className="grid grid-rows-[auto_minmax(0,1fr)] min-h-0 overflow-hidden border-l border-border bg-surface-1"
        style={{
          width: isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        <div className="grid gap-2 border-b border-border bg-gradient-to-b from-surface-2 to-surface-1 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            {isOpen ? (
              <div className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  Options
                </span>
                <span className="text-[11px] text-txt-3">
                  Organize advanced tools to suit your workflow.
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
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          {isOpen ? <Badge tone="accent">Workspace tools</Badge> : null}
        </div>

        {isOpen ? (
          <div className="grid min-h-0 content-start gap-2 overflow-auto p-2.5">
            {sectionOrder.map((id) => (
              <SidebarSection
                key={id}
                id={id}
                icon={sectionMeta[id].icon}
                title={sectionMeta[id].label}
                open={openSections[id]}
                onOpenChange={() => toggleSection(id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggingId === id}
              >
                {sectionContent[id]}
              </SidebarSection>
            ))}
          </div>
        ) : (
          <div className="grid content-start gap-1 p-1">
            {[
              { icon: Wrench, title: "Tools" },
              { icon: Bug, title: "Debug" },
            ].map((item) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-full text-txt-3 hover:text-violet-200"
                key={item.title}
                onClick={onToggle}
                title={item.title}
                type="button"
              >
                <item.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
