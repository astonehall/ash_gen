export function ResizeHandle({ onMouseDown, title }) {
  return (
    <button
      type="button"
      aria-label={title}
      className="group relative mt-1 h-[18px] w-full shrink-0 cursor-row-resize rounded-sm border border-border/80 bg-surface-2/70 transition-colors hover:border-violet-400/60 hover:bg-violet-500/10"
      onMouseDown={onMouseDown}
      title={title}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong transition-colors group-hover:bg-violet-400/90" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" />
      </span>
    </button>
  );
}
