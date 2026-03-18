import { Activity, Cpu, Globe, KeyRound, Loader2, Orbit } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
  const modelLabel =
    modelInfo?.model_checkpoint || modelInfo?.model_id || "No model loaded";

  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-surface-1/95 px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 items-center gap-2 rounded-sm border border-violet-500/25 bg-gradient-to-r from-violet-600/18 via-violet-500/10 to-transparent px-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-violet-500/15 text-violet-200">
            <Orbit className="h-3.5 w-3.5" />
          </div>
          <div className="grid leading-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
              AshGen
            </span>
            <span className="text-[11px] text-txt-3">
              Desktop generation workspace
            </span>
          </div>
        </div>

        <Badge tone={isOnline ? "success" : "error"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(220px,280px)_minmax(160px,180px)_minmax(0,1fr)] items-center gap-2">
        <label className="grid gap-1">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-txt-3">
            <Globe className="h-3 w-3" />
            Backend
          </span>
          <Input
            className="h-8 bg-surface-0/90"
            value={apiBaseUrl}
            onChange={(event) => onApiBaseUrlChange(event.target.value)}
            placeholder="http://127.0.0.1:8000"
          />
        </label>

        <label className="grid gap-1">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-txt-3">
            <KeyRound className="h-3 w-3" />
            API Key
          </span>
          <Input
            className="h-8 bg-surface-0/90"
            value={apiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="Optional"
            type="password"
          />
        </label>

        <div className="grid min-w-0 gap-1 rounded-sm border border-border bg-surface-0/80 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.16em] text-txt-3">
              Status
            </span>
            <span
              className="max-w-[16rem] truncate text-[11px] uppercase tracking-[0.16em] text-violet-200"
              title={modelLabel}
            >
              {modelLabel}
            </span>
          </div>
          <span className="truncate text-xs text-txt-2">{statusMessage}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="success"
          size="sm"
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
        </Button>
        <Button
          variant="info"
          size="sm"
          disabled={busy}
          onClick={onModelInfo}
          type="button"
          title="Fetch model info"
        >
          <Cpu className="h-3.5 w-3.5" />
          Model
        </Button>
      </div>
    </header>
  );
}
