const sectionClassName =
  "grid content-start gap-1.5 border border-[#2b3340] bg-[#1b2028] p-[7px]";

const headingClassName =
  "m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#98a5b7]";

const subtextClassName = "text-[0.8rem] text-[#d7dde7]";

const labelClassName = "grid gap-[3px] text-[0.74rem] text-[#b2bdcc]";

const textareaClassName =
  "min-h-[56px] w-full resize-y border border-[#364151] bg-[#12171d] px-1.5 py-1 text-[0.82rem] text-[#dfe6f2] outline-none placeholder:text-[#6f7c90] focus:border-[#6ea0ff]";

export function WorkspaceView({
  gallery,
  mainPreviewUrl,
  negativePrompt,
  onNegativePromptChange,
  onPromptChange,
  onSelectImage,
  previewMessage,
  prompt,
  selectedGalleryItem,
}) {
  return (
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-[#15191f]">
      <div className="grid min-h-0 content-start gap-1.5 overflow-auto p-1.5 [scrollbar-color:#353e4d_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#353e4d]">
        <section className={`${sectionClassName} min-h-[260px]`}>
          <div className="flex items-center justify-between gap-1.5">
            <h2 className={headingClassName}>Preview</h2>
            <span className={subtextClassName}>
              {mainPreviewUrl ? "Selected image" : "No preview available"}
            </span>
          </div>

          <div className="grid min-h-[320px] place-items-center border border-[#313948] bg-[#11151b]">
            {mainPreviewUrl ? (
              <img
                className="h-full max-h-[58vh] w-full object-contain bg-[#0f1318]"
                src={mainPreviewUrl}
                alt="Selected generation"
              />
            ) : (
              <div className="grid min-h-[110px] place-items-center gap-1 text-center text-[#9ca8b8]">
                <strong className="text-[0.92rem] font-semibold text-[#dfe6f2]">
                  Preview area
                </strong>
                <span className="text-[0.8rem] text-[#d7dde7]">
                  {previewMessage}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="flex items-center justify-between gap-1.5">
            <h2 className={headingClassName}>Gallery</h2>
            <span className={subtextClassName}>{gallery.length} items</span>
          </div>

          {gallery.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-1.5">
              {gallery.map((item) => (
                <button
                  className={`grid gap-[3px] border p-[3px] text-left transition-colors ${item.id === selectedGalleryItem?.id ? "border-[#6ea0ff] bg-[#1a2230]" : "border-[#303847] bg-[#151a21] hover:bg-[#1b212a]"}`}
                  key={item.id}
                  onClick={() => onSelectImage(item.id)}
                  type="button"
                >
                  {item.imageUrl ? (
                    <img
                      className="aspect-square w-full object-cover bg-[#0f1318]"
                      src={item.imageUrl}
                      alt={item.prompt}
                    />
                  ) : (
                    <div className="grid aspect-square content-center justify-items-center gap-1 border border-dashed border-[#455164] bg-[#10141a] p-2.5 text-center">
                      <strong className="text-[0.92rem] font-semibold text-[#dfe6f2]">
                        Artifact
                      </strong>
                      <span className="text-[0.74rem] text-[#a3afc0]">
                        {item.fileName || "Non-image output"}
                      </span>
                    </div>
                  )}

                  <span className="text-[0.74rem] text-[#a3afc0]">
                    {item.createdAt}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[110px] place-items-center gap-1 text-center text-[#9ca8b8]">
              <strong className="text-[0.92rem] font-semibold text-[#dfe6f2]">
                No finished generations yet
              </strong>
              <span className="text-[0.8rem] text-[#d7dde7]">
                Completed images will appear here as a compact gallery.
              </span>
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-[#2a313c] bg-[#1b2028] p-1.5">
        <div className="grid grid-cols-2 gap-1.5 max-[900px]:grid-cols-1">
          <label className={labelClassName}>
            Positive Prompt
            <textarea
              className={textareaClassName}
              rows={2}
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
            />
          </label>

          <label className={labelClassName}>
            Negative Prompt
            <textarea
              className={textareaClassName}
              rows={2}
              value={negativePrompt}
              onChange={(event) => onNegativePromptChange(event.target.value)}
              placeholder="low quality, blurry, bad anatomy"
            />
          </label>
        </div>
      </footer>
    </section>
  );
}
