import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ImageIcon, Layers, Play } from "lucide-react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import {
  DOCK_SECTION_IDS,
  RESIZE_CHROME_HEIGHT,
  clampGalleryHeight,
  clampPromptHeight,
  measureUsableStackHeight,
  resolveDockHeights,
} from "./workspace/layout";
import { GalleryPanel } from "./workspace/GalleryPanel";
import { PreviewPanel } from "./workspace/PreviewPanel";
import { PromptPanel } from "./workspace/PromptPanel";
import { WorkspaceSection } from "./workspace/WorkspaceSection";

export function WorkspaceView({
  busy,
  gallery,
  mainPreviewUrl,
  negativePrompt,
  onGenerate,
  onNegativePromptChange,
  onPromptChange,
  onSelectImage,
  previewMessage,
  prompt,
  selectedGalleryItem,
}) {
  const [dockOrder, setDockOrder] = useLocalStorageState(
    "ashgen:workspace:dock-order",
    DOCK_SECTION_IDS,
    (value) =>
      Array.isArray(value) &&
      value.length === DOCK_SECTION_IDS.length &&
      value.every((item) => DOCK_SECTION_IDS.includes(item)),
  );
  const [galleryHeight, setGalleryHeight] = useLocalStorageState(
    "ashgen:workspace:gallery-height",
    208,
    (value) => typeof value === "number" && Number.isFinite(value),
  );
  const [promptHeight, setPromptHeight] = useLocalStorageState(
    "ashgen:workspace:prompt-height",
    220,
    (value) => typeof value === "number" && Number.isFinite(value),
  );
  const stackRef = useRef(null);
  const [stackHeight, setStackHeight] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!stackRef.current) {
      return undefined;
    }

    const element = stackRef.current;
    const updateHeight = () => {
      setStackHeight(measureUsableStackHeight(element));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const sectionOrder = ["preview", ...dockOrder];

  const handleSectionDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return;
    }

    if (
      !DOCK_SECTION_IDS.includes(active.id) ||
      !DOCK_SECTION_IDS.includes(over.id)
    ) {
      return;
    }

    setDockOrder((current) => {
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const startPanelResize = (event, startHeight, setHeight, clamp) => {
    event.preventDefault();

    const startY = event.clientY;

    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      setHeight(clamp(startHeight + delta));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const resolvedHeights = resolveDockHeights(stackHeight, sectionOrder, {
    gallery: clampGalleryHeight(galleryHeight),
    prompt: clampPromptHeight(promptHeight),
  });

  const startGalleryResize = (event) =>
    startPanelResize(
      event,
      resolvedHeights.gallery,
      setGalleryHeight,
      clampGalleryHeight,
    );

  const startPromptResize = (event) =>
    startPanelResize(
      event,
      resolvedHeights.prompt,
      setPromptHeight,
      clampPromptHeight,
    );

  const sections = {
    preview: (
      <WorkspaceSection
        id="preview"
        icon={ImageIcon}
        title="Preview"
        subtitle={
          mainPreviewUrl ? "Focused output" : "Waiting for a generation"
        }
        badgeTone={mainPreviewUrl ? "accent" : "neutral"}
        badgeLabel={mainPreviewUrl ? "Active" : "Empty"}
        draggable={false}
        wrapperClassName="min-h-0 flex-1"
        cardClassName="flex min-h-[220px] flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
      >
        <PreviewPanel
          mainPreviewUrl={mainPreviewUrl}
          previewMessage={previewMessage}
        />
      </WorkspaceSection>
    ),
    gallery: (
      <WorkspaceSection
        id="gallery"
        icon={Layers}
        title="Gallery"
        subtitle="Recent generation history"
        badgeTone="accent"
        badgeLabel={`${gallery.length} items`}
        wrapperClassName="flex shrink-0 flex-col gap-1"
        wrapperStyle={{
          height: `${resolvedHeights.gallery + RESIZE_CHROME_HEIGHT}px`,
        }}
        cardClassName="flex min-h-0 flex-1 flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
      >
        <GalleryPanel
          gallery={gallery}
          onResizeStart={startGalleryResize}
          onSelectImage={onSelectImage}
          selectedGalleryItem={selectedGalleryItem}
        />
      </WorkspaceSection>
    ),
    prompt: (
      <WorkspaceSection
        id="prompt"
        icon={Play}
        title="Prompt"
        subtitle="Compose prompts and launch generation"
        badgeTone={busy ? "accent" : "neutral"}
        badgeLabel={busy ? "Running" : "Ready"}
        wrapperClassName="flex shrink-0 flex-col gap-1"
        wrapperStyle={{
          height: `${resolvedHeights.prompt + RESIZE_CHROME_HEIGHT}px`,
        }}
        cardClassName="flex min-h-0 flex-1 flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
      >
        <PromptPanel
          busy={busy}
          negativePrompt={negativePrompt}
          onGenerate={onGenerate}
          onNegativePromptChange={onNegativePromptChange}
          onPromptChange={onPromptChange}
          onResizeStart={startPromptResize}
          prompt={prompt}
        />
      </WorkspaceSection>
    ),
  };

  return (
    <section className="h-full min-h-0 overflow-hidden bg-surface-0/70">
      <div
        ref={stackRef}
        className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3"
      >
        {sections.preview}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={dockOrder}
            strategy={verticalListSortingStrategy}
          >
            {dockOrder.map((sectionId) => sections[sectionId])}
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
