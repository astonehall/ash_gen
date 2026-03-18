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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import {
  CONTROL_SECTION_META,
  ControlSectionContent,
} from "./sidebar/ControlSectionContent";
import { SidebarPanelHeader } from "./sidebar/SidebarPanelHeader";
import { Button } from "./ui/button";

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
      <aside
        className="grid grid-rows-[auto_minmax(0,1fr)] min-h-0 overflow-hidden border-r border-border bg-surface-1"
        style={{
          width: isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        <SidebarPanelHeader
          badgeLabel="Generation settings"
          CollapseIcon={ChevronLeft}
          ExpandIcon={ChevronRight}
          isOpen={isOpen}
          onToggle={onToggle}
          subtitle="Generation workspace"
          title="Controls"
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
                    icon={CONTROL_SECTION_META[id].icon}
                    title={CONTROL_SECTION_META[id].label}
                    open={openSections[id]}
                    onOpenChange={() => toggleSection(id)}
                  >
                    <ControlSectionContent
                      availableSchedules={availableSchedules}
                      generationOptions={generationOptions}
                      guidanceScale={guidanceScale}
                      height={height}
                      onGuidanceScaleChange={onGuidanceScaleChange}
                      onHeightChange={onHeightChange}
                      onSamplerChange={onSamplerChange}
                      onSeedChange={onSeedChange}
                      onSigmaScheduleChange={onSigmaScheduleChange}
                      onStepsChange={onStepsChange}
                      onWidthChange={onWidthChange}
                      sampler={sampler}
                      seed={seed}
                      sectionId={id}
                      sigmaSchedule={sigmaSchedule}
                      steps={steps}
                      widthValue={widthValue}
                    />
                  </SidebarSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid content-start gap-1 p-1">
            {[
              { icon: CONTROL_SECTION_META.canvas.icon, title: "Canvas" },
              { icon: CONTROL_SECTION_META.sampling.icon, title: "Sampling" },
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
