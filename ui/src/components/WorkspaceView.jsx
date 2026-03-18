import { ImageIcon, Layers, Loader2, Play, Sparkles } from "lucide-react";

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
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-surface-0">
      {/* Main content area */}
      <div className="grid min-h-0 content-start gap-2 overflow-auto p-2">
        {/* Preview */}
        <div className="grid min-h-[280px] gap-1">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3 text-txt-3" />
              <h2 className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
                Preview
              </h2>
            </div>
            <span className="text-2xs text-txt-3">
              {mainPreviewUrl ? "Selected image" : "No preview available"}
            </span>
          </div>

          <div className="grid min-h-[300px] place-items-center rounded-sm border border-border bg-surface-1">
            {mainPreviewUrl ? (
              <img
                className="h-full max-h-[60vh] w-full rounded-sm object-contain"
                src={mainPreviewUrl}
                alt="Selected generation"
              />
            ) : (
              <div className="grid place-items-center gap-2 p-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface-2">
                  <Sparkles className="h-5 w-5 text-txt-3" />
                </div>
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium text-txt-1">
                    Preview area
                  </span>
                  <span className="text-xs text-txt-3">{previewMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-txt-3" />
              <h2 className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
                Gallery
              </h2>
            </div>
            <span className="text-2xs text-txt-3">{gallery.length} items</span>
          </div>

          {gallery.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1.5">
              {gallery.map((item) => (
                <button
                  className={`group grid gap-1 rounded-sm border p-1 text-left transition-colors ${
                    item.id === selectedGalleryItem?.id
                      ? "border-accent bg-accent-muted"
                      : "border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2"
                  }`}
                  key={item.id}
                  onClick={() => onSelectImage(item.id)}
                  type="button"
                >
                  {item.imageUrl ? (
                    <img
                      className="aspect-square w-full rounded-sm object-cover"
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
                  <span className="truncate text-2xs text-txt-3 group-hover:text-txt-2">
                    {item.createdAt}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[80px] place-items-center gap-1 rounded-sm border border-dashed border-border bg-surface-1 text-center">
              <span className="text-xs text-txt-3">
                Completed generations will appear here
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Prompt dock */}
      <footer className="grid gap-2 border-t border-border bg-surface-1 p-2">
        <div className="grid grid-cols-2 gap-2 max-[900px]:grid-cols-1">
          <div className="grid gap-1">
            <label className="text-2xs font-medium text-txt-3">
              Positive Prompt
            </label>
            <textarea
              className="min-h-[48px] w-full resize-y rounded-sm border border-border bg-surface-0 px-2 py-1.5 text-xs text-txt-1 outline-none transition-colors placeholder:text-txt-3 focus:border-border-focus"
              rows={2}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-2xs font-medium text-txt-3">
              Negative Prompt
            </label>
            <textarea
              className="min-h-[48px] w-full resize-y rounded-sm border border-border bg-surface-0 px-2 py-1.5 text-xs text-txt-1 outline-none transition-colors placeholder:text-txt-3 focus:border-border-focus"
              rows={2}
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="low quality, blurry, bad anatomy"
            />
          </div>
        </div>
        <button
          className="flex h-9 w-full items-center justify-center gap-2 rounded-sm bg-[#7c3aed] text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(139,92,246,0.5)] transition-all hover:bg-[#6d28d9] hover:shadow-[0_0_14px_rgba(139,92,246,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
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
        </button>
      </footer>
    </section>
  );
}
