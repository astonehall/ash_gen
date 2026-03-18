import { Activity, Cpu, Globe, KeyRound, Loader2 } from "lucide-react";

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
  const isOnline = health?.status === "ok";
  const modelLabel = modelInfo?.model_checkpoint || modelInfo?.model_id || null;

  return (
    <header className="flex items-center gap-px border-b border-border bg-surface-1">
      {/* App brand */}
      <div className="flex items-center gap-2 border-r border-border px-3 py-1.5">
        <span className="text-sm font-bold tracking-tight text-accent">
          ASH<span className="text-txt-1">GEN</span>
        </span>
      </div>

      {/* Connection fields */}
      <div className="flex items-center gap-1 border-r border-border px-2 py-1">
        <Globe className="h-3.5 w-3.5 shrink-0 text-txt-3" />
        <input
          className="h-6 w-44 rounded-sm border border-border bg-surface-0 px-1.5 text-xs text-txt-1 outline-none placeholder:text-txt-3 focus:border-border-focus"
          value={apiBaseUrl}
          onChange={(e) => onApiBaseUrlChange(e.target.value)}
          placeholder="http://127.0.0.1:8000"
        />
      </div>

      <div className="flex items-center gap-1 border-r border-border px-2 py-1">
        <KeyRound className="h-3.5 w-3.5 shrink-0 text-txt-3" />
        <input
          className="h-6 w-28 rounded-sm border border-border bg-surface-0 px-1.5 text-xs text-txt-1 outline-none placeholder:text-txt-3 focus:border-border-focus"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="API key"
          type="password"
        />
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 border-r border-border px-3 py-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${isOnline ? "bg-status-ok" : "bg-status-error"}`}
          />
          <span className="text-2xs font-medium uppercase tracking-wide text-txt-2">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        {modelLabel && (
          <span
            className="max-w-[140px] truncate text-2xs text-txt-2"
            title={modelLabel}
          >
            {modelLabel}
          </span>
        )}
      </div>

      {/* Status message */}
      <div className="flex min-w-0 flex-1 items-center px-3 py-1">
        <span className="truncate text-2xs text-txt-3">{statusMessage}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 px-2">
        <button
          className="flex items-center gap-1.5 rounded-sm border border-[#2d6a4f] bg-[#1b4332] px-3 py-1 text-xs font-semibold text-[#52d68a] transition-colors hover:bg-[#245740] hover:text-[#6ee7a8] disabled:opacity-40"
          disabled={busy}
          onClick={onHealthCheck}
          type="button"
          title="Check backend health"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Activity className="h-3.5 w-3.5" />
          )}
          Health
        </button>
        <button
          className="flex items-center gap-1.5 rounded-sm border border-[#374b8a] bg-[#1e2e6e] px-3 py-1 text-xs font-semibold text-[#7aa8ff] transition-colors hover:bg-[#26398a] hover:text-[#99bfff] disabled:opacity-40"
          disabled={busy}
          onClick={onModelInfo}
          type="button"
          title="Fetch model info"
        >
          <Cpu className="h-3.5 w-3.5" />
          Model
        </button>
      </div>
    </header>
  );
}
