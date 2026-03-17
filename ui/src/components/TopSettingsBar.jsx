export function TopSettingsBar({
  apiBaseUrl,
  apiKey,
  busy,
  health,
  modelInfo,
  onApiBaseUrlChange,
  onApiKeyChange,
  onHealthCheck,
  onModelInfo,
  statusMessage,
}) {
  const topSettings = [
    {
      id: "backend-url",
      label: "Backend",
      control: (
        <input
          value={apiBaseUrl}
          onChange={(event) => onApiBaseUrlChange(event.target.value)}
          placeholder="http://127.0.0.1:8000"
        />
      ),
    },
    {
      id: "api-key",
      label: "API Key",
      control: (
        <input
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
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
        <button disabled={busy} onClick={onHealthCheck} type="button">
          Health
        </button>
        <button disabled={busy} onClick={onModelInfo} type="button">
          Model
        </button>
      </div>
    </header>
  );
}
