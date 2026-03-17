const fieldClassName =
  "min-h-7 w-full border border-[#364151] bg-[#12171d] px-1.5 py-1 text-[0.82rem] text-[#dfe6f2] outline-none placeholder:text-[#6f7c90] focus:border-[#6ea0ff]";

const valueClassName =
  "flex min-h-7 w-full items-center overflow-hidden border border-[#364151] bg-[#12171d] px-1.5 py-1 text-[0.8rem] text-[#d7dde7] text-ellipsis whitespace-nowrap";

const buttonClassName =
  "min-h-10 whitespace-nowrap border border-[#344051] bg-[#262d38] px-[9px] py-[5px] text-[0.8rem] text-[#dfe6f2] transition-colors hover:bg-[#2e3744] disabled:cursor-not-allowed disabled:opacity-60";

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
          className={fieldClassName}
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
          className={fieldClassName}
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          placeholder="Optional"
        />
      ),
    },
    {
      id: "status-message",
      label: "Status",
      control: <div className={valueClassName}>{statusMessage}</div>,
    },
    {
      id: "backend-health",
      label: "Backend State",
      control: (
        <div className={valueClassName}>
          {health?.status === "ok" ? "Online" : "Offline"}
        </div>
      ),
    },
    {
      id: "model-info",
      label: "Model",
      control: (
        <div className={valueClassName}>
          {modelInfo?.model_checkpoint || modelInfo?.model_id || "Not loaded"}
        </div>
      ),
    },
  ];

  return (
    <header className="grid items-start gap-1.5 border-b border-[#2a313c] bg-[#1c2129] p-1.5 [grid-template-columns:minmax(0,1fr)_auto] max-[900px]:grid-cols-1">
      <div className="flex min-w-0 items-start gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-color:#353e4d_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#353e4d]">
        <div className="grid min-h-10 min-w-[164px] content-start gap-0.5 border border-[#2d3643] bg-[#20262f] px-1.5 py-1">
          <strong className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#98a5b7]">
            AshGen
          </strong>
          <span className="text-[0.8rem] text-[#d7dde7]">
            Local generation workspace
          </span>
        </div>

        {topSettings.map((item) => (
          <label
            className="grid min-h-10 min-w-[148px] content-start gap-0.5 border border-[#2d3643] bg-[#20262f] px-1.5 py-1 text-[0.74rem] text-[#b2bdcc]"
            key={item.id}
          >
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#98a5b7]">
              {item.label}
            </span>
            {item.control}
          </label>
        ))}
      </div>

      <div className="flex items-stretch gap-1.5">
        <button
          className={buttonClassName}
          disabled={busy}
          onClick={onHealthCheck}
          type="button"
        >
          Health
        </button>
        <button
          className={buttonClassName}
          disabled={busy}
          onClick={onModelInfo}
          type="button"
        >
          Model
        </button>
      </div>
    </header>
  );
}
