import { useMemo, useState } from "react";

const defaultPrompt = "portrait photo, soft lighting";

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:8000");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [generation, setGeneration] = useState(null);
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
        width: 512,
        height: 512,
        steps: 20,
        guidance_scale: 6.0,
      };

      const data = await callJson("/v1/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setGeneration(data);
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

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>AshGen UI</h1>
        <p>Local desktop-first frontend for AshGen backend</p>
      </header>

      <section className="card">
        <h2>Connection</h2>
        <label>
          Backend URL
          <input
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
          />
        </label>
        <label>
          API Key (optional)
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="X-API-Key"
          />
        </label>
      </section>

      <section className="card actions">
        <h2>Actions</h2>
        <div className="button-row">
          <button disabled={busy} onClick={run(checkHealth)}>
            Health
          </button>
          <button disabled={busy} onClick={run(fetchModelInfo)}>
            Model Info
          </button>
        </div>
        <label>
          Prompt
          <textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
        </label>
        <label>
          Negative Prompt
          <textarea
            rows={3}
            value={negativePrompt}
            onChange={(event) => setNegativePrompt(event.target.value)}
            placeholder="low quality, blurry, bad anatomy"
          />
        </label>
        <button disabled={busy || !prompt.trim()} onClick={run(generateImage)}>
          Generate
        </button>
      </section>

      <section className="card">
        <h2>Status</h2>
        <p>{statusMessage}</p>
      </section>

      <section className="card">
        <h2>Response Snapshot</h2>
        <pre>{JSON.stringify({ health, modelInfo, generation }, null, 2)}</pre>
      </section>

      <section className="card">
        <h2>Generated Output</h2>
        {generatedImageUrl ? (
          <img
            className="generated-image"
            src={generatedImageUrl}
            alt="Generated output"
          />
        ) : (
          <p>No image output yet.</p>
        )}
      </section>
    </main>
  );
}

export default App;
