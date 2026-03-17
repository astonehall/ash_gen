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
    <section className="main-workspace">
      <div className="main-content-scroll">
        <section className="workspace-section preview-section">
          <div className="section-heading-row">
            <h2>Preview</h2>
            <span>
              {mainPreviewUrl ? "Selected image" : "No preview available"}
            </span>
          </div>
          <div className="preview-surface">
            {mainPreviewUrl ? (
              <img
                className="main-preview-image"
                src={mainPreviewUrl}
                alt="Selected generation"
              />
            ) : (
              <div className="preview-empty-state">
                <strong>Preview area</strong>
                <span>{previewMessage}</span>
              </div>
            )}
          </div>
        </section>

        <section className="workspace-section gallery-section">
          <div className="section-heading-row">
            <h2>Gallery</h2>
            <span>{gallery.length} items</span>
          </div>
          {gallery.length ? (
            <div className="gallery-grid">
              {gallery.map((item) => (
                <button
                  className={`gallery-tile ${item.id === selectedGalleryItem?.id ? "is-selected" : ""}`}
                  key={item.id}
                  onClick={() => onSelectImage(item.id)}
                  type="button"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.prompt} />
                  ) : (
                    <div className="gallery-artifact-placeholder">
                      <strong>Artifact</strong>
                      <span>{item.fileName || "Non-image output"}</span>
                    </div>
                  )}
                  <span>{item.createdAt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="gallery-empty-state">
              <strong>No finished generations yet</strong>
              <span>
                Completed images will appear here as a compact gallery.
              </span>
            </div>
          )}
        </section>
      </div>

      <footer className="prompt-dock">
        <div className="prompt-grid">
          <label>
            Positive Prompt
            <textarea
              rows={2}
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
            />
          </label>
          <label>
            Negative Prompt
            <textarea
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
