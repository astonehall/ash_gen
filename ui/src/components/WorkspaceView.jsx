import { ImageIcon, Layers, Loader2, Play, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";

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
  return (
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-surface-0/70">
      <div className="grid min-h-0 content-start gap-3 overflow-auto p-3">
        <Card className="min-h-[360px] overflow-hidden border-border-strong bg-surface-1/90">
          <CardHeader className="border-b border-border bg-surface-2/65 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-violet-500/12 text-violet-200">
                <ImageIcon className="h-3.5 w-3.5" />
              </div>
              <div className="grid gap-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-2">
                  Preview
                </h2>
                <span className="text-xs text-txt-3">
                  {mainPreviewUrl
                    ? "Focused output"
                    : "Waiting for a generation"}
                </span>
              </div>
            </div>
            <Badge tone={mainPreviewUrl ? "accent" : "neutral"}>
              {mainPreviewUrl ? "Active" : "Empty"}
            </Badge>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid min-h-[300px] place-items-center rounded-sm border border-border-strong bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_32%),linear-gradient(180deg,rgba(23,23,36,0.96),rgba(9,9,15,0.96))]">
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
          </CardContent>
        </Card>

        <Card className="border-border-strong bg-surface-1/90">
          <CardHeader className="border-b border-border bg-surface-2/65 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-violet-500/12 text-violet-200">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="grid gap-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-txt-2">
                  Gallery
                </h2>
                <span className="text-xs text-txt-3">
                  Recent generation history
                </span>
              </div>
            </div>
            <Badge tone="accent">{gallery.length} items</Badge>
          </CardHeader>
          <CardContent className="p-3">
            {gallery.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(136px,1fr))] gap-2">
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
              <div className="grid min-h-[88px] place-items-center gap-2 rounded-sm border border-dashed border-violet-500/20 bg-violet-500/5 text-center">
                <span className="text-xs font-medium text-txt-2">
                  No finished generations yet
                </span>
                <span className="text-xs text-txt-3">
                  Completed outputs will appear here as a quick-access strip.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
