import { Bug, Cpu, HeartPulse, Settings2, Wrench } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

function InfoRow({ label, value, tone = "neutral" }) {
  return (
    <div className="grid justify-items-start gap-1.5 rounded-sm border border-border bg-surface-0 px-2.5 py-2">
      <span className="text-[10px] uppercase tracking-[0.16em] text-txt-3">
        {label}
      </span>
      <Badge
        className="max-w-full text-left normal-case tracking-[0.04em]"
        tone={tone}
      >
        {value}
      </Badge>
    </div>
  );
}

export const OPTIONS_SECTION_META = {
  tools: { icon: Wrench, label: "Tools" },
  debug: { icon: Bug, label: "Debug" },
};

export function OptionsSectionContent({
  generation,
  health,
  modelInfo,
  onHealthCheck,
  onModelInfo,
  sectionId,
  statusMessage,
}) {
  if (sectionId === "tools") {
    return (
      <Card className="border-dashed border-violet-500/20 bg-violet-500/5">
        <CardContent className="grid place-items-center gap-2 p-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-violet-500/12 text-violet-200">
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium text-txt-1">
              Future tool dock
            </span>
            <span className="text-xs text-txt-3">
              Batch, upscale, masking, and presets will live here.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <InfoRow label="Status" value={statusMessage} tone="accent" />
        <InfoRow
          label="Backend"
          value={health?.status === "ok" ? "Online" : "Offline"}
          tone={health?.status === "ok" ? "success" : "error"}
        />
        <InfoRow
          label="Model"
          value={
            modelInfo?.model_checkpoint || modelInfo?.model_id || "Not loaded"
          }
          tone="accent"
        />
        <InfoRow
          label="Device"
          value={modelInfo?.resolved_device || "Unknown"}
          tone="neutral"
        />
        <InfoRow
          label="Last Result"
          value={generation?.image_id || "None"}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-[1180px]:grid-cols-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={onHealthCheck}
          type="button"
          className="w-full justify-start"
        >
          <HeartPulse className="h-3.5 w-3.5" />
          Refresh Health
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onModelInfo}
          type="button"
          className="w-full justify-start"
        >
          <Cpu className="h-3.5 w-3.5" />
          Refresh Model
        </Button>
      </div>

      <pre className="max-h-[220px] overflow-auto rounded-sm border border-border bg-surface-0 p-2 text-left text-2xs leading-relaxed text-txt-2">
        {JSON.stringify(
          { statusMessage, health, modelInfo, generation },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
