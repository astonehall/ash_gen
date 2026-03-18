import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Bug, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { Button } from "./ui/button";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import {
  OPTIONS_SECTION_META,
  OptionsSectionContent,
} from "./sidebar/OptionsSectionContent";
import { SidebarPanelHeader } from "./sidebar/SidebarPanelHeader";

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    setSectionOrder((current) => {
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
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
        <SidebarPanelHeader
          badgeLabel="Workspace tools"
          CollapseIcon={ChevronRight}
          ExpandIcon={ChevronLeft}
          isOpen={isOpen}
          onToggle={onToggle}
          subtitle="Runtime and tools"
          title="Options"
        />

        {isOpen ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid min-h-0 content-start gap-2 overflow-auto p-2.5">
                {sectionOrder.map((id) => (
                  <SidebarSection
                    key={id}
                    id={id}
                    icon={OPTIONS_SECTION_META[id].icon}
                    title={OPTIONS_SECTION_META[id].label}
                    open={openSections[id]}
                    onOpenChange={() => toggleSection(id)}
                  >
                    <OptionsSectionContent
                      generation={generation}
                      health={health}
                      modelInfo={modelInfo}
                      onHealthCheck={onHealthCheck}
                      onModelInfo={onModelInfo}
                      sectionId={id}
                      statusMessage={statusMessage}
                    />
                  </SidebarSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid content-start gap-1 p-1">
            {[
              { icon: OPTIONS_SECTION_META.tools.icon, title: "Tools" },
              { icon: OPTIONS_SECTION_META.debug.icon, title: "Debug" },
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
