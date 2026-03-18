import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Frame,
  SlidersHorizontal,
} from "lucide-react";
import { FieldControl } from "./FieldControl";
import { SidebarSection } from "./SidebarSection";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { formatOptionLabel } from "../lib/appConfig";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

function getResizerClassName(isOpen) {
  const base =
    "relative w-1.5 min-h-0 bg-surface-0 max-[900px]:hidden before:absolute before:inset-y-0 before:left-[2px] before:right-[2px] before:transition-colors";
  return isOpen
    ? `${base} cursor-col-resize before:bg-border hover:before:bg-accent`
    : `${base} cursor-default before:bg-surface-2`;
}

export function ControlSidebar({
  availableSchedules,
  collapsedRailWidth,
  generationOptions,
  guidanceScale,
  height,
  isOpen,
  onGuidanceScaleChange,
  onHeightChange,
  onResizeStart,
  onSamplerChange,
  onSeedChange,
  onSigmaScheduleChange,
  onStepsChange,
  onToggle,
  onWidthChange,
  sampler,
  seed,
  sigmaSchedule,
  steps,
  width,
  widthValue,
}) {
  const [sectionOrder, setSectionOrder] = useLocalStorageState(
    "ashgen:controls:section-order",
    ["canvas", "sampling"],
    (value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((item) => ["canvas", "sampling"].includes(item)),
  );
  const [openSections, setOpenSections] = useLocalStorageState(
    "ashgen:controls:open-sections",
    {
      canvas: true,
      sampling: true,
    },
    (value) =>
      Boolean(value) &&
      typeof value === "object" &&
      typeof value.canvas === "boolean" &&
      typeof value.sampling === "boolean",
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
    canvas: { icon: Frame, label: "Canvas" },
    sampling: { icon: SlidersHorizontal, label: "Sampling" },
  };

  const sectionContent = {
    canvas: (
      <div className="grid grid-cols-2 gap-2">
        <FieldControl label="Width">
          <Input
            type="number"
            min="256"
            max="2048"
            step="64"
            value={widthValue}
            onChange={(e) => onWidthChange(Number(e.target.value))}
          />
        </FieldControl>
        <FieldControl label="Height">
          <Input
            type="number"
            min="256"
            max="2048"
            step="64"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
          />
        </FieldControl>
      </div>
    ),
    sampling: (
      <>
        <div className="grid grid-cols-2 gap-2">
          <FieldControl label="Sampler">
            <Select
              value={sampler}
              onChange={(e) => onSamplerChange(e.target.value)}
            >
              {generationOptions.samplers.map((opt) => (
                <option key={opt} value={opt}>
                  {formatOptionLabel(opt)}
                </option>
              ))}
            </Select>
          </FieldControl>
          <FieldControl label="Scheduler">
            <Select
              value={sigmaSchedule}
              onChange={(e) => onSigmaScheduleChange(e.target.value)}
            >
              {availableSchedules.map((opt) => (
                <option key={opt} value={opt}>
                  {formatOptionLabel(opt)}
                </option>
              ))}
            </Select>
          </FieldControl>
          <FieldControl label="Steps">
            <Input
              type="number"
              min="1"
              max="150"
              value={steps}
              onChange={(e) => onStepsChange(Number(e.target.value))}
            />
          </FieldControl>
          <FieldControl label="Guidance">
            <Input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={guidanceScale}
              onChange={(e) => onGuidanceScaleChange(Number(e.target.value))}
            />
          </FieldControl>
        </div>
        <FieldControl label="Seed" description="Leave empty for random">
          <Input
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            placeholder="Random if blank"
          />
        </FieldControl>
      </>
    ),
  };

  return (
    <>
      <aside
        className="grid grid-rows-[auto_minmax(0,1fr)] min-h-0 overflow-hidden border-r border-border bg-surface-1"
        style={{
          width: isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        <div className="grid gap-2 border-b border-border bg-gradient-to-b from-surface-2 to-surface-1 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            {isOpen ? (
              <div className="grid gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  Controls
                </span>
                <span className="text-[11px] text-txt-3">
                  Drag cards to reorder your workflow.
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
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          {isOpen ? <Badge tone="accent">Generation settings</Badge> : null}
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
              { icon: Frame, title: "Canvas" },
              { icon: SlidersHorizontal, title: "Sampling" },
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

      <div
        aria-hidden="true"
        className={getResizerClassName(isOpen)}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />
    </>
  );
}
