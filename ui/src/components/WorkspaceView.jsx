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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ImageIcon,
  Layers,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { cn } from "../lib/utils";

const GALLERY_MIN_HEIGHT = 176;
const GALLERY_MAX_HEIGHT = 440;

function clampGalleryHeight(value) {
  return Math.min(GALLERY_MAX_HEIGHT, Math.max(GALLERY_MIN_HEIGHT, value));
}

function WorkspaceSection({
  id,
  title,
  subtitle,
  icon: Icon,
  badgeTone,
  badgeLabel,
  className,
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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "overflow-hidden border-border-strong bg-surface-1/90 transition-opacity",
          isDragging && "opacity-40 shadow-[0_14px_32px_rgba(0,0,0,0.35)]",
          className,
        )}
      >
        <CardHeader className="border-b border-border bg-surface-2/65 px-3 py-2">
          <div className="flex items-center gap-2">
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
        <CardContent className={cn("p-3", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [sectionOrder, setSectionOrder] = useLocalStorageState(
    "ashgen:workspace:section-order",
    ["preview", "gallery"],
    (value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((item) => ["preview", "gallery"].includes(item)),
  );
  const [galleryHeight, setGalleryHeight] = useLocalStorageState(
    "ashgen:workspace:gallery-height",
    208,
    (value) => typeof value === "number" && Number.isFinite(value),
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

  const handleSectionDragEnd = ({ active, over }) => {
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

  const startGalleryResize = (event) => {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = galleryHeight;

    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      setGalleryHeight(clampGalleryHeight(startHeight + delta));
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

  const galleryPanelHeight = clampGalleryHeight(galleryHeight);

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
        className="min-h-[320px] flex-1"
        contentClassName="h-full p-3"
      >
        <div className="grid h-full min-h-[300px] place-items-center rounded-sm border border-border-strong bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_32%),linear-gradient(180deg,rgba(23,23,36,0.96),rgba(9,9,15,0.96))]">
          {mainPreviewUrl ? (
            <img
              className="h-full max-h-[58vh] w-full rounded-sm object-contain"
              src={mainPreviewUrl}
              alt="Selected generation"
            />
          ) : (
            <div className="grid place-items-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-violet-500/25 bg-violet-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-txt-1">
                  Preview area
                </span>
                <span className="max-w-md text-xs text-txt-3">
                  {previewMessage}
                </span>
              </div>
            </div>
          )}
        </div>
      </WorkspaceSection>
    ),
    gallery: (
      <div className="shrink-0" style={{ height: `${galleryPanelHeight}px` }}>
        <div
          aria-hidden="true"
          className="mb-2 h-2 cursor-row-resize rounded-sm bg-surface-2/70 transition-colors hover:bg-violet-500/30"
          onMouseDown={startGalleryResize}
          title="Resize gallery"
        />
        <WorkspaceSection
          id="gallery"
          icon={Layers}
          title="Gallery"
          subtitle="Recent generation history"
          badgeTone="accent"
          badgeLabel={`${gallery.length} items`}
          className="h-[calc(100%-0.5rem)]"
          contentClassName="grid h-[calc(100%-3.25rem)] p-3"
        >
          {gallery.length ? (
            <div className="grid h-full min-h-0 grid-cols-[repeat(auto-fill,minmax(136px,1fr))] content-start gap-2 overflow-y-auto pr-1">
              {gallery.map((item) => (
                <button
                  className={cn(
                    "group grid gap-2 rounded-sm border p-2 text-left transition-colors",
                    item.id === selectedGalleryItem?.id
                      ? "border-violet-500/45 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
                      : "border-border bg-surface-2 hover:border-border-strong hover:bg-surface-3/70",
                  )}
                  key={item.id}
                  onClick={() => onSelectImage(item.id)}
                  type="button"
                >
                  {item.imageUrl ? (
                    <img
                      className="aspect-square w-full rounded-sm border border-border object-cover"
                      src={item.imageUrl}
                      alt={item.prompt}
                    />
                  ) : (
                    <div className="grid aspect-square content-center justify-items-center gap-1 rounded-sm border border-dashed border-border-strong bg-surface-0 p-2 text-center">
                      <Layers className="h-4 w-4 text-txt-3" />
                      <span className="text-2xs text-txt-3">
                        {item.fileName || "Artifact"}
                      </span>
                    </div>
                  )}
                  <div className="grid gap-1">
                    <span className="truncate text-xs text-txt-2 group-hover:text-txt-1">
                      {item.prompt}
                    </span>
                    <span className="text-2xs text-txt-3">
                      {item.createdAt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid h-full min-h-[88px] place-items-center gap-2 rounded-sm border border-dashed border-violet-500/20 bg-violet-500/5 text-center">
              <span className="text-xs font-medium text-txt-2">
                No finished generations yet
              </span>
              <span className="text-xs text-txt-3">
                Completed outputs will appear here as a quick-access strip.
              </span>
            </div>
          )}
        </WorkspaceSection>
      </div>
    ),
  };

  return (
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-surface-0/70">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex min-h-0 flex-col gap-3 overflow-hidden p-3">
            {sectionOrder.map((sectionId) => sections[sectionId])}
          </div>
        </SortableContext>
      </DndContext>

      <footer className="border-t border-border bg-surface-1/95 p-3 backdrop-blur-sm">
        <Card className="border-violet-500/20 bg-gradient-to-b from-surface-1 to-surface-2">
          <CardContent className="grid gap-3 p-3">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 max-[980px]:grid-cols-1">
              <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
                  Positive Prompt
                </span>
                <Textarea
                  rows={3}
                  value={prompt}
                  onChange={(event) => onPromptChange(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
                  Negative Prompt
                </span>
                <Textarea
                  rows={3}
                  value={negativePrompt}
                  onChange={(event) =>
                    onNegativePromptChange(event.target.value)
                  }
                  placeholder="low quality, blurry, bad anatomy"
                />
              </label>
              <div className="grid min-w-[180px] content-end gap-2 max-[980px]:min-w-0">
                <Badge tone="accent">Primary action</Badge>
                <Button
                  className="h-11 w-full shadow-[0_0_28px_rgba(139,92,246,0.2)]"
                  disabled={busy || !prompt.trim()}
                  onClick={onGenerate}
                  type="button"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </footer>
    </section>
  );
}
