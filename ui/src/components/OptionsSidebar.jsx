const rightRailItems = [
  { id: "options", label: "OPT", title: "Open options" },
  { id: "session", label: "SES", title: "Open session panel" },
  { id: "debug", label: "DBG", title: "Open debug panel" },
];

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
        className={`panel-resizer right-resizer ${isOpen ? "" : "is-disabled"}`}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />

      <aside
        className={`side-panel right-panel ${isOpen ? "" : "is-collapsed"}`}
        style={{ width: isOpen ? `${width}px` : `${collapsedRailWidth}px` }}
      >
        <div className="panel-header-row">
          <h2>{isOpen ? "Options" : "Opt"}</h2>
          <button className="panel-toggle" onClick={onToggle} type="button">
            {isOpen ? "Hide" : "Show"}
          </button>
        </div>

        {isOpen ? (
          <div className="panel-scroll">
            <div className="control-group">
              <h3>Reserved Space</h3>
              <p>
                Use this panel later for batch tools, upscaling, masking,
                presets, or export actions.
              </p>
            </div>

            <div className="control-group">
              <h3>Current Session</h3>
              <div className="info-list">
                <div>
                  <span>Backend</span>
                  <strong>
                    {health?.status === "ok" ? "Online" : "Offline"}
                  </strong>
                </div>
                <div>
                  <span>Device</span>
                  <strong>{modelInfo?.resolved_device || "Unknown"}</strong>
                </div>
                <div>
                  <span>Last Result</span>
                  <strong>{generation?.image_id || "None"}</strong>
                </div>
              </div>
            </div>

            <div className="control-group">
              <h3>Debug Snapshot</h3>
              <pre>
                {JSON.stringify({ health, modelInfo, generation }, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="panel-rail">
            {rightRailItems.map((item) => (
              <button
                className="rail-button"
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
