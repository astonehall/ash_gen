import { Globe, KeyRound, Orbit } from "lucide-react";
import { Input } from "./ui/input";

export function TopSettingsBar({
  apiBaseUrl,
  apiKey,
  onApiBaseUrlChange,
  onApiKeyChange,
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border bg-surface-1/95 px-3 py-2 backdrop-blur-sm">
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
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(240px,320px)_minmax(170px,210px)] items-center justify-end gap-2">
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
      </div>
    </header>
  );
}
