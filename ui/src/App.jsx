import { useMemo, useState } from "react";

const defaultPrompt = "portrait photo, soft lighting";

function App() {
  const minSidebarWidth = 220;
  const maxSidebarWidth = 520;
  const collapsedRailWidth = 52;
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:8000");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(6.0);
  const [seed, setSeed] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);
  const [busy, setBusy] = useState(false);

  const headers = useMemo(() => {
    const output = { "Content-Type": "application/json" };
    if (apiKey.trim()) {
      output["X-API-Key"] = apiKey.trim();
    }
    return output;
  }, [apiKey]);

  const callJson = async (path, options = {}) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const body = await response.text();
    let parsed;

    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      parsed = body;
    }

    if (!response.ok) {
      const detail = parsed?.detail || parsed || `HTTP ${response.status}`;
      throw new Error(String(detail));
    }

    return parsed;
  };

  const withBusy = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const generatedImageUrl = useMemo(() => {
    const imagePath = generation?.image_path;
    if (!imagePath) {
      return null;
    }

    const imageFileName = imagePath.split("/").pop();
    if (!imageFileName) {
      return null;
    }

    const isImage = /\.(png|jpg|jpeg|webp)$/i.test(imageFileName);
    if (!isImage) {
      return null;
    }

    return `${apiBaseUrl}/outputs/${imageFileName}`;
  }, [apiBaseUrl, generation]);

  const checkHealth = () =>
    withBusy(async () => {
      const data = await callJson("/health", { method: "GET" });
      setHealth(data);
      setStatusMessage("Health check successful");
    });

  const fetchModelInfo = () =>
    withBusy(async () => {
      const data = await callJson("/v1/model/info", { method: "GET" });
      setModelInfo(data);
      setStatusMessage("Model info loaded");
    });

  const generateImage = () =>
    withBusy(async () => {
      const payload = {
        prompt,
        negative_prompt: negativePrompt.trim() || null,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        seed: seed.trim() ? Number(seed) : null,
      };

      const data = await callJson("/v1/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setGeneration(data);
      setGallery((current) => {
        const nextItem = {
          id: data.image_id,
          imageUrl: `${apiBaseUrl}/outputs/${data.image_path.split("/").pop()}`,
          prompt,
          createdAt: new Date().toLocaleTimeString(),
        };

        return [nextItem, ...current].slice(0, 24);
      });
      setSelectedImageId(data.image_id);
      setStatusMessage("Generation request completed");
    });

  const run = (fn) => async () => {
    try {
      await fn();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Request failed",
      );
    }
  };

  const selectedGalleryItem = useMemo(() => {
    if (!gallery.length) {
      return null;
    }

    return gallery.find((item) => item.id === selectedImageId) || gallery[0];
  }, [gallery, selectedImageId]);

  const mainPreviewUrl = selectedGalleryItem?.imageUrl || generatedImageUrl;

  const clampSidebarWidth = (value) =>
    Math.min(maxSidebarWidth, Math.max(minSidebarWidth, value));

  const startResize = (side) => (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const initialWidth = side === "left" ? leftSidebarWidth : rightSidebarWidth;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;

      if (side === "left") {
        setLeftSidebarWidth(clampSidebarWidth(initialWidth + delta));
        return;
      }

      setRightSidebarWidth(clampSidebarWidth(initialWidth - delta));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const leftRailItems = [
    { id: "controls", label: "CTL", title: "Open controls" },
    { id: "sampling", label: "SMP", title: "Open sampling controls" },
    { id: "run", label: "RUN", title: "Open run controls" },
  ];

  const rightRailItems = [
    { id: "options", label: "OPT", title: "Open options" },
    { id: "session", label: "SES", title: "Open session panel" },
    { id: "debug", label: "DBG", title: "Open debug panel" },
  ];

  const topSettings = [
    {
      id: "backend-url",
      label: "Backend",
      control: (
        <input
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
        />
      ),
    },
    {
      id: "api-key",
      label: "API Key",
      control: (
        <input
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Optional"
        />
      ),
    },
    {
      id: "status-message",
      label: "Status",
      control: <div className="topbar-value">{statusMessage}</div>,
    },
    {
      id: "backend-health",
      label: "Backend State",
      control: (
        <div className="topbar-value">
          {health?.status === "ok" ? "Online" : "Offline"}
        </div>
      ),
    },
    {
      id: "model-info",
      label: "Model",
      control: (
        <div className="topbar-value">
          {modelInfo?.model_checkpoint || modelInfo?.model_id || "Not loaded"}
        </div>
      ),
    },
  ];

  return (
    <main className="desktop-shell">
      <header className="top-settings-bar">
        <div className="top-settings-track">
          <div className="app-title-block">
            <strong>AshGen</strong>
            <span>Local generation workspace</span>
          </div>
          {topSettings.map((item) => (
            <label className="top-setting" key={item.id}>
              <span>{item.label}</span>
              {item.control}
            </label>
          ))}
        </div>
        <div className="top-settings-actions">
          <button disabled={busy} onClick={run(checkHealth)} type="button">
            Health
          </button>
          <button disabled={busy} onClick={run(fetchModelInfo)} type="button">
            Model
          </button>
        </div>
      </header>

      <section className="workspace-shell">
        <aside
          className={`side-panel left-panel ${leftSidebarOpen ? "" : "is-collapsed"}`}
          style={{
            width: leftSidebarOpen
              ? `${leftSidebarWidth}px`
              : `${collapsedRailWidth}px`,
          }}
        >
          <div className="panel-header-row">
            <h2>{leftSidebarOpen ? "Controls" : "Ctl"}</h2>
            <button
              className="panel-toggle"
              onClick={() => setLeftSidebarOpen((current) => !current)}
              type="button"
            >
              {leftSidebarOpen ? "Hide" : "Show"}
            </button>
          </div>

          {leftSidebarOpen ? (
            <div className="panel-scroll">
              <div className="control-group">
                <h3>Canvas</h3>
                <div className="compact-grid">
                  <label>
                    Width
                    <input
                      type="number"
                      min="256"
                      max="2048"
                      step="64"
                      value={width}
                      onChange={(event) => setWidth(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Height
                    <input
                      type="number"
                      min="256"
                      max="2048"
                      step="64"
                      value={height}
                      onChange={(event) =>
                        setHeight(Number(event.target.value))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="control-group">
                <h3>Sampling</h3>
                <div className="compact-grid">
                  <label>
                    Steps
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={steps}
                      onChange={(event) => setSteps(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Guidance
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="0.1"
                      value={guidanceScale}
                      onChange={(event) =>
                        setGuidanceScale(Number(event.target.value))
                      }
                    />
                  </label>
                </div>
                <label>
                  Seed
                  <input
                    value={seed}
                    onChange={(event) => setSeed(event.target.value)}
                    placeholder="Random if blank"
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Run</h3>
                <button
                  className="primary-button"
                  disabled={busy || !prompt.trim()}
                  onClick={run(generateImage)}
                  type="button"
                >
                  {busy ? "Generating" : "Generate"}
                </button>
              </div>
            </div>
          ) : (
            <div className="panel-rail">
              {leftRailItems.map((item) => (
                <button
                  className="rail-button"
                  key={item.id}
                  onClick={() => setLeftSidebarOpen(true)}
                  title={item.title}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </aside>

        <div
          aria-hidden="true"
          className={`panel-resizer left-resizer ${leftSidebarOpen ? "" : "is-disabled"}`}
          onMouseDown={leftSidebarOpen ? startResize("left") : undefined}
        />

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
                    <span>
                      Live generation previews can slot in here later.
                    </span>
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
                      onClick={() => setSelectedImageId(item.id)}
                      type="button"
                    >
                      <img src={item.imageUrl} alt={item.prompt} />
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
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </label>
              <label>
                Negative Prompt
                <textarea
                  rows={2}
                  value={negativePrompt}
                  onChange={(event) => setNegativePrompt(event.target.value)}
                  placeholder="low quality, blurry, bad anatomy"
                />
              </label>
            </div>
          </footer>
        </section>

        <div
          aria-hidden="true"
          className={`panel-resizer right-resizer ${rightSidebarOpen ? "" : "is-disabled"}`}
          onMouseDown={rightSidebarOpen ? startResize("right") : undefined}
        />

        <aside
          className={`side-panel right-panel ${rightSidebarOpen ? "" : "is-collapsed"}`}
          style={{
            width: rightSidebarOpen
              ? `${rightSidebarWidth}px`
              : `${collapsedRailWidth}px`,
          }}
        >
          <div className="panel-header-row">
            <h2>{rightSidebarOpen ? "Options" : "Opt"}</h2>
            <button
              className="panel-toggle"
              onClick={() => setRightSidebarOpen((current) => !current)}
              type="button"
            >
              {rightSidebarOpen ? "Hide" : "Show"}
            </button>
          </div>

          {rightSidebarOpen ? (
            <div className="panel-scroll">
              <div className="control-group">
                <h3>Reserved Space</h3>
                <p>
                  Use this panel later for batch tools, upscaling, masking,
                  presets, or export actions.
                </p>
              </div>

              <div className="control-group">
                <h3>Current Session</h3>
                <div className="info-list">
                  <div>
                    <span>Backend</span>
                    <strong>
                      {health?.status === "ok" ? "Online" : "Offline"}
                    </strong>
                  </div>
                  <div>
                    <span>Device</span>
                    <strong>{modelInfo?.resolved_device || "Unknown"}</strong>
                  </div>
                  <div>
                    <span>Last Result</span>
                    <strong>{generation?.image_id || "None"}</strong>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <h3>Debug Snapshot</h3>
                <pre>
                  {JSON.stringify({ health, modelInfo, generation }, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="panel-rail">
              {rightRailItems.map((item) => (
                <button
                  className="rail-button"
                  key={item.id}
                  onClick={() => setRightSidebarOpen(true)}
                  title={item.title}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
