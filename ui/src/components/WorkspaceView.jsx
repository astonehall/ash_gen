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
const PROMPT_MIN_HEIGHT = 188;
const PROMPT_MAX_HEIGHT = 420;
const PREVIEW_MIN_HEIGHT = 220;
const STACK_GAP = 12;
const RESIZE_CHROME_HEIGHT = 12;

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
      className="h-2 w-full shrink-0 cursor-row-resize rounded-sm bg-surface-2/70 transition-colors hover:bg-violet-500/30"
      onMouseDown={onMouseDown}
      title={title}
    />
  );
}

function resolveDockHeights(containerHeight, sectionOrder, storedHeights) {
  const fixedIds = sectionOrder.filter((id) => id !== "preview");

  if (!containerHeight || !fixedIds.length) {
    return storedHeights;
  }

  const minimumHeights = {
    gallery: GALLERY_MIN_HEIGHT,
    prompt: PROMPT_MIN_HEIGHT,
  };
  const availableCardHeight =
    containerHeight -
    STACK_GAP * Math.max(sectionOrder.length - 1, 0) -
    RESIZE_CHROME_HEIGHT * fixedIds.length -
    PREVIEW_MIN_HEIGHT;

  const desiredTotal = fixedIds.reduce((sum, id) => sum + storedHeights[id], 0);

  if (availableCardHeight >= desiredTotal) {
    return storedHeights;
  }

  const reducedHeights = { ...storedHeights };
  const totalSlack = fixedIds.reduce(
    (sum, id) => sum + Math.max(0, storedHeights[id] - minimumHeights[id]),
    0,
  );
  const shortage = desiredTotal - Math.max(availableCardHeight, 0);

  if (totalSlack <= 0 || shortage >= totalSlack) {
    fixedIds.forEach((id) => {
      reducedHeights[id] = minimumHeights[id];
    });
    return reducedHeights;
  }

  fixedIds.forEach((id, index) => {
    const slack = Math.max(0, storedHeights[id] - minimumHeights[id]);
    const proportionalReduction = (shortage * slack) / totalSlack;
    const roundedReduction =
      index === fixedIds.length - 1
        ? shortage -
          fixedIds.slice(0, -1).reduce((sum, currentId) => {
            const currentSlack = Math.max(
              0,
              storedHeights[currentId] - minimumHeights[currentId],
            );
            return sum + Math.round((shortage * currentSlack) / totalSlack);
          }, 0)
        : Math.round(proportionalReduction);

    reducedHeights[id] = Math.max(
      minimumHeights[id],
      storedHeights[id] - roundedReduction,
    );
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
  wrapperClassName,
  className,
  contentClassName,
  wrapperStyle,
  cardStyle,
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
    <div
      ref={setNodeRef}
      style={{ ...style, ...wrapperStyle }}
      className={cn("w-full self-stretch", wrapperClassName)}
    >
      <Card
        style={cardStyle}
        className={cn(
          "h-full w-full overflow-hidden border-border-strong bg-surface-1/90 transition-opacity",
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
        <CardContent className={cn("w-full p-3", contentClassName)}>
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
    ["preview", "gallery", "prompt"],
    (value) =>
      Array.isArray(value) &&
      value.length === 3 &&
      value.every((item) => ["preview", "gallery", "prompt"].includes(item)),
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

  const galleryPanelHeight = clampGalleryHeight(galleryHeight);
  const promptPanelHeight = clampPromptHeight(promptHeight);
  const resolvedHeights = resolveDockHeights(stackHeight, sectionOrder, {
    gallery: galleryPanelHeight,
    prompt: promptPanelHeight,
  });

  useEffect(() => {
    if (!stackRef.current) {
      return undefined;
    }

    const element = stackRef.current;
    const updateHeight = () => {
      const computedStyle = window.getComputedStyle(element);
      const verticalPadding =
        Number.parseFloat(computedStyle.paddingTop || "0") +
        Number.parseFloat(computedStyle.paddingBottom || "0");

      setStackHeight(Math.max(0, element.clientHeight - verticalPadding));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const startGalleryResize = (event) =>
    startPanelResize(
      event,
      galleryPanelHeight,
      setGalleryHeight,
      clampGalleryHeight,
    );

  const startPromptResize = (event) =>
    startPanelResize(
      event,
      promptPanelHeight,
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
        wrapperClassName="min-h-0 flex-1 w-full"
        className="flex min-h-[220px] flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
      >
        <div className="flex h-full min-h-0 w-full items-center justify-center rounded-sm border border-border-strong bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_32%),linear-gradient(180deg,rgba(23,23,36,0.96),rgba(9,9,15,0.96))]">
          {mainPreviewUrl ? (
            <img
              className="max-h-full max-w-full rounded-sm object-contain"
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
      <WorkspaceSection
        id="gallery"
        icon={Layers}
        title="Gallery"
        subtitle="Recent generation history"
        badgeTone="accent"
        badgeLabel={`${gallery.length} items`}
        wrapperClassName="w-full shrink-0"
        wrapperStyle={{
          height: `${resolvedHeights.gallery + RESIZE_CHROME_HEIGHT}px`,
        }}
        className="flex min-h-0 flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
        cardStyle={{ height: `${resolvedHeights.gallery}px` }}
      >
        <div className="flex h-full min-h-0 w-full flex-col gap-1">
          <ResizeHandle
            onMouseDown={startGalleryResize}
            title="Resize gallery"
          />
          {gallery.length ? (
            <div className="grid min-h-0 flex-1 w-full grid-cols-[repeat(auto-fit,minmax(136px,136px))] justify-center gap-2 overflow-y-auto pr-1">
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
            <div className="grid min-h-[88px] flex-1 place-items-center gap-2 rounded-sm border border-dashed border-violet-500/20 bg-violet-500/5 text-center">
              <span className="text-xs font-medium text-txt-2">
                No finished generations yet
              </span>
              <span className="text-xs text-txt-3">
                Completed outputs will appear here as a quick-access strip.
              </span>
            </div>
          )}
        </div>
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
        wrapperClassName="w-full shrink-0"
        wrapperStyle={{
          height: `${resolvedHeights.prompt + RESIZE_CHROME_HEIGHT}px`,
        }}
        className="flex min-h-0 flex-col"
        contentClassName="flex min-h-0 flex-1 p-3"
        cardStyle={{ height: `${resolvedHeights.prompt}px` }}
      >
        <div className="flex h-full min-h-0 w-full flex-col gap-1">
          <ResizeHandle
            onMouseDown={startPromptResize}
            title="Resize prompt panel"
          />
          <div className="grid min-h-0 w-full flex-1 gap-3 min-[981px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
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
            <div className="grid min-h-0 content-end gap-2 max-[980px]:min-w-0">
              <Badge tone="accent">Primary action</Badge>
              <span className="text-xs text-txt-3">
                Drag this panel anywhere in the workspace and resize it when you
                need more writing room.
              </span>
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
      </WorkspaceSection>
    ),
  };

  return (
    <section className="h-full min-h-0 overflow-hidden bg-surface-0/70">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={stackRef}
            className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3"
          >
            {sectionOrder.map((sectionId) => sections[sectionId])}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
