import { Loader2, Play } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ResizeHandle } from "./ResizeHandle";

export function PromptPanel({
  busy,
  negativePrompt,
  onGenerate,
  onNegativePromptChange,
  onPromptChange,
  onResizeStart,
  prompt,
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="grid min-h-0 flex-1 w-full gap-3 min-[1080px]:grid-cols-[minmax(0,1fr)_240px]">
        <div className="grid min-h-0 gap-3 min-[760px]:grid-cols-2">
          <label className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
              Positive Prompt
            </span>
            <Textarea
              className="h-full min-h-[112px] resize-none overflow-y-auto"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
            />
          </label>
          <label className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-txt-3">
              Negative Prompt
            </span>
            <Textarea
              className="h-full min-h-[112px] resize-none overflow-y-auto"
              value={negativePrompt}
              onChange={(event) => onNegativePromptChange(event.target.value)}
              placeholder="low quality, blurry, bad anatomy"
            />
          </label>
        </div>

        <div className="grid min-h-0 content-stretch">
          <div className="flex min-h-0 flex-col justify-end gap-2 rounded-sm border border-violet-500/20 bg-gradient-to-b from-violet-500/8 to-surface-2 p-3">
            <Badge className="self-start" tone="accent">
              GENERATE
            </Badge>
            <div className="grid gap-2">
              <Button
                className="h-11 w-full shadow-[0_0_28px_rgba(139,92,246,0.2)]"
                disabled={busy || !prompt.trim()}
                onClick={onGenerate}
                type="button"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ResizeHandle onMouseDown={onResizeStart} title="Resize prompt panel" />
    </div>
  );
}
