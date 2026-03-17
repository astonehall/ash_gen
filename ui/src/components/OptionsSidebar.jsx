const panelTitleClassName =
  "m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#98a5b7]";

const bodyTextClassName = "text-[0.8rem] text-[#d7dde7]";

const cardClassName =
  "grid content-start gap-1.5 border border-[#2b3340] bg-[#1b2028] p-[7px]";

const buttonClassName =
  "border border-[#344051] bg-[#262d38] px-[9px] py-[5px] text-[0.8rem] text-[#dfe6f2] transition-colors hover:bg-[#2e3744] disabled:cursor-not-allowed disabled:opacity-60";

const rightRailItems = [
  { id: "options", label: "OPT", title: "Open options" },
  { id: "session", label: "SES", title: "Open session panel" },
  { id: "debug", label: "DBG", title: "Open debug panel" },
];

function getResizerClassName(isOpen) {
  const baseClassName =
    "relative min-h-0 bg-[#15191f] max-[900px]:hidden before:absolute before:inset-y-0 before:left-[2px] before:right-[2px]";

  return isOpen
    ? `${baseClassName} cursor-col-resize before:bg-[#2a313c] hover:before:bg-[#45638f]`
    : `${baseClassName} cursor-default before:bg-[#20252d]`;
}

export function OptionsSidebar({
  collapsedRailWidth,
  generation,
  health,
  isOpen,
  modelInfo,
  onResizeStart,
  onToggle,
  width,
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className={getResizerClassName(isOpen)}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />

      <aside
        className={`grid min-h-0 w-[var(--panel-width)] overflow-hidden border-l border-[#2a313c] bg-[#1a1f26] max-[900px]:w-auto ${isOpen ? "grid-rows-[auto_minmax(0,1fr)]" : "grid-rows-[auto]"}`}
        style={{
          "--panel-width": isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        <div
          className={`min-h-9 border-b border-[#2a313c] px-2 py-[7px] ${isOpen ? "flex items-center justify-between gap-1.5" : "grid justify-items-center gap-1.5"}`}
        >
          <h2 className={panelTitleClassName}>{isOpen ? "Options" : "Opt"}</h2>
          <button
            className={`${buttonClassName} ${isOpen ? "px-2" : "w-full px-2"}`}
            onClick={onToggle}
            type="button"
          >
            {isOpen ? "Hide" : "Show"}
          </button>
        </div>

        {isOpen ? (
          <div className="grid min-h-0 content-start gap-2 overflow-auto p-2 [scrollbar-color:#353e4d_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#353e4d]">
            <div className={cardClassName}>
              <h3 className={panelTitleClassName}>Reserved Space</h3>
              <p className={bodyTextClassName}>
                Use this panel later for batch tools, upscaling, masking,
                presets, or export actions.
              </p>
            </div>

            <div className={cardClassName}>
              <h3 className={panelTitleClassName}>Current Session</h3>
              <div className="grid gap-[5px]">
                <div className="grid gap-0.5 border border-[#313948] bg-[#151a21] px-1.5 py-[5px]">
                  <span className="text-[0.8rem] text-[#d7dde7]">Backend</span>
                  <strong className="text-[0.82rem] text-[#dfe6f2]">
                    {health?.status === "ok" ? "Online" : "Offline"}
                  </strong>
                </div>

                <div className="grid gap-0.5 border border-[#313948] bg-[#151a21] px-1.5 py-[5px]">
                  <span className="text-[0.8rem] text-[#d7dde7]">Device</span>
                  <strong className="text-[0.82rem] text-[#dfe6f2]">
                    {modelInfo?.resolved_device || "Unknown"}
                  </strong>
                </div>

                <div className="grid gap-0.5 border border-[#313948] bg-[#151a21] px-1.5 py-[5px]">
                  <span className="text-[0.8rem] text-[#d7dde7]">
                    Last Result
                  </span>
                  <strong className="text-[0.82rem] text-[#dfe6f2]">
                    {generation?.image_id || "None"}
                  </strong>
                </div>
              </div>
            </div>

            <div className={cardClassName}>
              <h3 className={panelTitleClassName}>Debug Snapshot</h3>
              <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-words border border-[#313948] bg-[#11151b] p-1.5 text-[0.8rem] text-[#d7dde7] [scrollbar-color:#353e4d_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#353e4d]">
                {JSON.stringify({ health, modelInfo, generation }, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="grid content-start gap-[5px] px-[5px] py-1.5">
            {rightRailItems.map((item) => (
              <button
                className="min-h-9 w-full border border-[#344051] bg-[#262d38] px-1 py-1.5 text-[0.72rem] tracking-[0.04em] text-[#dfe6f2] transition-colors hover:bg-[#2e3744]"
                key={item.id}
                onClick={onToggle}
                title={item.title}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
