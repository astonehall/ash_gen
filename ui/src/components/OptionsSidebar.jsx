import { useRef, useState } from "react";
import {
  Bug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GripVertical,
  Monitor,
  Settings2,
  Wrench,
} from "lucide-react";

function InfoRow({ label, value, status }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-sm bg-surface-0 px-2 py-1.5">
      <span className="text-2xs text-txt-3">{label}</span>
      <span
        className={`text-xs font-medium ${
          status === "ok"
            ? "text-status-ok"
            : status === "error"
              ? "text-status-error"
              : "text-txt-1"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DraggableSection({
  id,
  icon: Icon,
  label,
  open,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  children,
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragOver={(e) => onDragOver(e, id)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-sm border border-border-strong bg-surface-2 transition-opacity ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-txt-3 hover:text-txt-2 active:cursor-grabbing" />
        <button
          type="button"
          className="flex flex-1 items-center justify-between text-left"
          onClick={onToggle}
        >
          <div className="flex items-center gap-1.5">
            {Icon && <Icon className="h-3 w-3 text-txt-3" />}
            <span className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
              {label}
            </span>
          </div>
          {open ? (
            <ChevronUp className="h-3 w-3 text-txt-3" />
          ) : (
            <ChevronDown className="h-3 w-3 text-txt-3" />
          )}
        </button>
      </div>
      {open && (
        <div className="grid gap-2 border-t border-border px-2 pb-2.5 pt-2">
          {children}
        </div>
      )}
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
  onResizeStart,
  onToggle,
  width,
}) {
  const [sectionOrder, setSectionOrder] = useState([
    "tools",
    "session",
    "debug",
  ]);
  const [openSections, setOpenSections] = useState({
    tools: true,
    session: true,
    debug: false,
  });
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
    session: { icon: Monitor, label: "Session" },
    debug: { icon: Bug, label: "Debug" },
  };

  const sectionContent = {
    tools: (
      <div className="grid place-items-center gap-1 rounded-sm border border-dashed border-border bg-surface-0 px-3 py-4 text-center">
        <Settings2 className="h-4 w-4 text-txt-3" />
        <span className="text-xs text-txt-3">
          Batch, upscale, masking, and presets coming later
        </span>
      </div>
    ),
    session: (
      <div className="grid gap-1">
        <InfoRow
          label="Backend"
          value={health?.status === "ok" ? "Online" : "Offline"}
          status={health?.status === "ok" ? "ok" : "error"}
        />
        <InfoRow
          label="Device"
          value={modelInfo?.resolved_device || "Unknown"}
        />
        <InfoRow label="Last Result" value={generation?.image_id || "None"} />
      </div>
    ),
    debug: (
      <pre className="max-h-[200px] overflow-auto rounded-sm border border-border bg-surface-0 p-2 text-2xs leading-relaxed text-txt-2">
        {JSON.stringify({ health, modelInfo, generation }, null, 2)}
      </pre>
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
        <div className="flex h-8 items-center justify-between border-b border-border px-2">
          {isOpen && (
            <span className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
              Options
            </span>
          )}
          <button
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-txt-1"
            onClick={onToggle}
            type="button"
            title={isOpen ? "Collapse panel" : "Expand panel"}
          >
            {isOpen ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {isOpen ? (
          <div className="grid min-h-0 content-start gap-2 overflow-auto p-2">
            {sectionOrder.map((id) => (
              <DraggableSection
                key={id}
                id={id}
                icon={sectionMeta[id].icon}
                label={sectionMeta[id].label}
                open={openSections[id]}
                onToggle={() => toggleSection(id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggingId === id}
              >
                {sectionContent[id]}
              </DraggableSection>
            ))}
          </div>
        ) : (
          <div className="grid content-start gap-1 p-1">
            {[
              { icon: Wrench, title: "Tools" },
              { icon: Monitor, title: "Session" },
              { icon: Bug, title: "Debug" },
            ].map((item) => (
              <button
                className="flex h-8 w-full items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-txt-1"
                key={item.title}
                onClick={onToggle}
                title={item.title}
                type="button"
              >
                <item.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
