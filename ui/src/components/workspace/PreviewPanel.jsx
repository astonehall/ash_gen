import { Sparkles } from "lucide-react";

export function PreviewPanel({ mainPreviewUrl, previewMessage }) {
  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-sm border border-border-strong bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,rgba(23,23,36,0.96),rgba(9,9,15,0.98))] p-4">
      {mainPreviewUrl ? (
        <div className="relative flex h-full max-h-full w-full items-center justify-center rounded-sm border border-violet-500/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,8,14,0.92))] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="pointer-events-none absolute left-4 top-4 rounded-sm border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-100">
            Current preview
          </div>
          <img
            className="max-h-full max-w-[min(100%,72vh)] rounded-sm object-contain shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
            src={mainPreviewUrl}
            alt="Selected generation"
          />
        </div>
      ) : (
        <div className="grid place-items-center gap-4 rounded-sm border border-dashed border-violet-500/24 bg-violet-500/6 px-10 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-txt-1">Preview area</span>
            <span className="max-w-md text-xs leading-relaxed text-txt-3">
              {previewMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
