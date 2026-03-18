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
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Textarea } from "./ui/textarea";

const GALLERY_MIN_HEIGHT = 176;
const GALLERY_MAX_HEIGHT = 440;
const PROMPT_MIN_HEIGHT = 168;
const PROMPT_MAX_HEIGHT = 420;
const PREVIEW_MIN_HEIGHT = 220;
const STACK_GAP = 12;
const RESIZE_CHROME_HEIGHT = 18;
const DOCK_SECTION_IDS = ["gallery", "prompt"];

function clampHeight(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampGalleryHeight(value) {
  return clampHeight(value, GALLERY_MIN_HEIGHT, GALLERY_MAX_HEIGHT);
}

function clampPromptHeight(value) {
  return clampHeight(value, PROMPT_MIN_HEIGHT, PROMPT_MAX_HEIGHT);
}

function ResizeHandle({ onMouseDown, title }) {
  return (
    <button
      type="button"
      aria-label={title}
      className="group relative mt-1 h-[18px] w-full shrink-0 cursor-row-resize rounded-sm border border-border/80 bg-surface-2/70 transition-colors hover:border-violet-400/60 hover:bg-violet-500/10"
      onMouseDown={onMouseDown}
      title={title}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong transition-colors group-hover:bg-violet-400/90" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
      </span>
    </button>
  );
}

function measureUsableStackHeight(element) {
  const computedStyle = window.getComputedStyle(element);
  const verticalPadding =
    Number.parseFloat(computedStyle.paddingTop || "0") +
    Number.parseFloat(computedStyle.paddingBottom || "0");

  return Math.max(0, element.clientHeight - verticalPadding);
}

function resolveDockHeights(containerHeight, sectionOrder, storedHeights) {
  const dockIds = sectionOrder.filter((id) => id !== "preview");

  if (!containerHeight || !dockIds.length) {
    return storedHeights;
  }

  const minimumHeights = {
    gallery: GALLERY_MIN_HEIGHT,
    prompt: PROMPT_MIN_HEIGHT,
  };
  const availableDockHeight =
    containerHeight -
    STACK_GAP * Math.max(sectionOrder.length - 1, 0) -
    RESIZE_CHROME_HEIGHT * dockIds.length -
    PREVIEW_MIN_HEIGHT;
  const desiredDockHeight = dockIds.reduce(
    (sum, id) => sum + storedHeights[id],
    0,
  );

  if (availableDockHeight >= desiredDockHeight) {
    return storedHeights;
  }

  const reducedHeights = { ...storedHeights };
  const totalSlack = dockIds.reduce(
    (sum, id) => sum + Math.max(0, storedHeights[id] - minimumHeights[id]),
    0,
  );
  const shortage = desiredDockHeight - Math.max(availableDockHeight, 0);

  if (totalSlack <= 0 || shortage >= totalSlack) {
    dockIds.forEach((id) => {
      reducedHeights[id] = minimumHeights[id];
    });
    return reducedHeights;
  }

  let remainingShortage = shortage;
  dockIds.forEach((id, index) => {
    const slack = Math.max(0, storedHeights[id] - minimumHeights[id]);
    const reduction =
      index === dockIds.length - 1
        ? remainingShortage
        : Math.min(
            remainingShortage,
            Math.round((shortage * slack) / totalSlack),
          );

    reducedHeights[id] = Math.max(
      minimumHeights[id],
      storedHeights[id] - reduction,
    );
    remainingShortage -= reduction;
  });

  return reducedHeights;
}

function WorkspaceSection({
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

function PreviewPanel({ mainPreviewUrl, previewMessage }) {
  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-sm border border-border-strong bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,rgba(23,23,36,0.96),rgba(9,9,15,0.98))] p-4">
      {mainPreviewUrl ? (
        <div className="relative flex h-full max-h-full w-full items-center justify-center rounded-sm border border-violet-500/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,8,14,0.92))] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="pointer-events-none absolute left-4 top-4 rounded-sm border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-100">
            Current preview
          </div>
          <img
            className="max-h-full max-w-[min(100%,72vh)] rounded-sm object-contain shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
            src={mainPreviewUrl}
            alt="Selected generation"
          />
        </div>
      ) : (
        <div className="grid place-items-center gap-4 rounded-sm border border-dashed border-violet-500/24 bg-violet-500/6 px-10 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-txt-1">Preview area</span>
            <span className="max-w-md text-xs leading-relaxed text-txt-3">
              {previewMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryPanel({
  gallery,
  onSelectImage,
  onResizeStart,
  selectedGalleryItem,
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {gallery.length ? (
        <div className="grid min-h-0 flex-1 w-full grid-cols-[repeat(auto-fit,minmax(168px,168px))] justify-center gap-3 overflow-y-auto pr-1 max-[1380px]:grid-cols-[repeat(auto-fit,minmax(152px,152px))] max-[1180px]:grid-cols-[repeat(auto-fit,minmax(144px,144px))]">
          {gallery.map((item) => (
            <button
              className={cn(
                "group relative grid gap-2.5 rounded-sm border p-2.5 text-left transition-all",
                item.id === selectedGalleryItem?.id
                  ? "border-violet-400/70 bg-violet-500/12 shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_10px_24px_rgba(31,18,58,0.24)]"
                  : "border-border bg-surface-2 hover:border-violet-500/35 hover:bg-surface-3/70 hover:shadow-[0_8px_22px_rgba(0,0,0,0.2)]",
              )}
              key={item.id}
              onClick={() => onSelectImage(item.id)}
              type="button"
            >
              {item.id === selectedGalleryItem?.id ? (
                <Badge
                  className="absolute right-2.5 top-2.5 z-10"
                  tone="accent"
                >
                  Selected
                </Badge>
              ) : null}
              {item.imageUrl ? (
                <div className="overflow-hidden rounded-sm border border-border bg-surface-0">
                  <img
                    className="aspect-[4/5] w-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
                    src={item.imageUrl}
                    alt={item.prompt}
                  />
                </div>
              ) : (
                <div className="grid aspect-[4/5] content-center justify-items-center gap-1 rounded-sm border border-dashed border-border-strong bg-surface-0 p-2 text-center">
                  <Layers className="h-4 w-4 text-txt-3" />
                  <span className="text-2xs text-txt-3">
                    {item.fileName || "Artifact"}
                  </span>
                </div>
              )}
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-[0.14em]",
                      item.id === selectedGalleryItem?.id
                        ? "text-violet-200"
                        : "text-txt-3",
                    )}
                  >
                    {item.createdAt}
                  </span>
                </div>
                <span className="min-h-[2rem] text-xs font-medium leading-snug text-txt-1 transition-colors group-hover:text-violet-100">
                  {item.prompt}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[88px] flex-1 place-items-center gap-2 rounded-sm border border-dashed border-violet-500/20 bg-violet-500/5 text-center">
          <span className="text-xs font-medium text-txt-2">
            No finished generations yet
          </span>
          <span className="text-xs text-txt-3">
            Completed outputs will appear here as a quick-access strip.
          </span>
        </div>
      )}
      <ResizeHandle onMouseDown={onResizeStart} title="Resize gallery" />
    </div>
  );
}

function PromptPanel({
  busy,
  negativePrompt,
  onGenerate,
  onNegativePromptChange,
  onPromptChange,
  onResizeStart,
  prompt,
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="grid min-h-0 flex-1 w-full gap-3 min-[1080px]:grid-cols-[minmax(0,1fr)_240px]">
        <div className="grid min-h-0 gap-3 min-[760px]:grid-cols-2">
          <label className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
              Positive Prompt
            </span>
            <Textarea
              className="h-full min-h-[112px] resize-none overflow-y-auto"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
            />
          </label>
          <label className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
              Negative Prompt
            </span>
            <Textarea
              className="h-full min-h-[112px] resize-none overflow-y-auto"
              value={negativePrompt}
              onChange={(event) => onNegativePromptChange(event.target.value)}
              placeholder="low quality, blurry, bad anatomy"
            />
          </label>
        </div>

        <div className="grid min-h-0 content-stretch">
          <div className="flex min-h-0 flex-col justify-end gap-2 rounded-sm border border-violet-500/20 bg-gradient-to-b from-violet-500/8 to-surface-2 p-3">
            <Badge className="self-start" tone="accent">
              GENERATE
            </Badge>
            <div className="grid gap-2">
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
        </div>
      </div>
      <ResizeHandle onMouseDown={onResizeStart} title="Resize prompt panel" />
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
