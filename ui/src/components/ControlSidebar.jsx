import { formatOptionLabel } from "../lib/appConfig";

const leftRailItems = [
  { id: "controls", label: "CTL", title: "Open controls" },
  { id: "sampling", label: "SMP", title: "Open sampling controls" },
  { id: "run", label: "RUN", title: "Open run controls" },
];

export function ControlSidebar({
  availableSchedules,
  busy,
  collapsedRailWidth,
  generationOptions,
  guidanceScale,
  height,
  isOpen,
  onGenerate,
  onGuidanceScaleChange,
  onHeightChange,
  onResizeStart,
  onSamplerChange,
  onSeedChange,
  onSigmaScheduleChange,
  onStepsChange,
  onToggle,
  onWidthChange,
  prompt,
  sampler,
  seed,
  sigmaSchedule,
  steps,
  width,
  widthValue,
}) {
  return (
    <>
      <aside
        className={`side-panel left-panel ${isOpen ? "" : "is-collapsed"}`}
        style={{ width: isOpen ? `${width}px` : `${collapsedRailWidth}px` }}
      >
        <div className="panel-header-row">
          <h2>{isOpen ? "Controls" : "Ctl"}</h2>
          <button className="panel-toggle" onClick={onToggle} type="button">
            {isOpen ? "Hide" : "Show"}
          </button>
        </div>

        {isOpen ? (
          <div className="panel-scroll">
            <div className="control-group">
              <h3>Canvas</h3>
              <div className="compact-grid">
                <label>
                  Width
                  <input
                    type="number"
                    min="256"
                    max="2048"
                    step="64"
                    value={widthValue}
                    onChange={(event) =>
                      onWidthChange(Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Height
                  <input
                    type="number"
                    min="256"
                    max="2048"
                    step="64"
                    value={height}
                    onChange={(event) =>
                      onHeightChange(Number(event.target.value))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="control-group">
              <h3>Sampling</h3>
              <div className="compact-grid">
                <label>
                  Sampler
                  <select
                    value={sampler}
                    onChange={(event) => onSamplerChange(event.target.value)}
                  >
                    {generationOptions.samplers.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Scheduler
                  <select
                    value={sigmaSchedule}
                    onChange={(event) =>
                      onSigmaScheduleChange(event.target.value)
                    }
                  >
                    {availableSchedules.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Steps
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={steps}
                    onChange={(event) =>
                      onStepsChange(Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Guidance
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.1"
                    value={guidanceScale}
                    onChange={(event) =>
                      onGuidanceScaleChange(Number(event.target.value))
                    }
                  />
                </label>
              </div>
              <label>
                Seed
                <input
                  value={seed}
                  onChange={(event) => onSeedChange(event.target.value)}
                  placeholder="Random if blank"
                />
              </label>
            </div>

            <div className="control-group">
              <h3>Run</h3>
              <button
                className="primary-button"
                disabled={busy || !prompt.trim()}
                onClick={onGenerate}
                type="button"
              >
                {busy ? "Generating" : "Generate"}
              </button>
            </div>
          </div>
        ) : (
          <div className="panel-rail">
            {leftRailItems.map((item) => (
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

      <div
        aria-hidden="true"
        className={`panel-resizer left-resizer ${isOpen ? "" : "is-disabled"}`}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />
    </>
  );
}
