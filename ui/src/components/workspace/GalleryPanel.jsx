import { Layers } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { ResizeHandle } from "./ResizeHandle";

export function GalleryPanel({
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
