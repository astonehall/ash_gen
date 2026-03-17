import { formatOptionLabel } from "../lib/appConfig";

const leftRailItems = [
  { id: "controls", label: "CTL", title: "Open controls" },
  { id: "sampling", label: "SMP", title: "Open sampling controls" },
  { id: "run", label: "RUN", title: "Open run controls" },
];

const panelTitleClassName =
  "m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#98a5b7]";

const labelClassName = "grid gap-[3px] text-[0.74rem] text-[#b2bdcc]";

const fieldClassName =
  "min-h-7 w-full border border-[#364151] bg-[#12171d] px-1.5 py-1 text-[0.82rem] text-[#dfe6f2] outline-none placeholder:text-[#6f7c90] focus:border-[#6ea0ff]";

const cardClassName =
  "grid content-start gap-1.5 border border-[#2b3340] bg-[#1b2028] p-[7px]";

const compactGridClassName = "grid grid-cols-2 gap-1.5 max-[900px]:grid-cols-1";

const buttonClassName =
  "border border-[#344051] bg-[#262d38] px-[9px] py-[5px] text-[0.8rem] text-[#dfe6f2] transition-colors hover:bg-[#2e3744] disabled:cursor-not-allowed disabled:opacity-60";

function getResizerClassName(isOpen) {
  const baseClassName =
    "relative min-h-0 bg-[#15191f] max-[900px]:hidden before:absolute before:inset-y-0 before:left-[2px] before:right-[2px]";

  return isOpen
    ? `${baseClassName} cursor-col-resize before:bg-[#2a313c] hover:before:bg-[#45638f]`
    : `${baseClassName} cursor-default before:bg-[#20252d]`;
}

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
        className={`grid min-h-0 w-[var(--panel-width)] overflow-hidden border-r border-[#2a313c] bg-[#1a1f26] max-[900px]:w-auto ${isOpen ? "grid-rows-[auto_minmax(0,1fr)]" : "grid-rows-[auto]"}`}
        style={{
          "--panel-width": isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        <div
          className={`min-h-9 border-b border-[#2a313c] px-2 py-[7px] ${isOpen ? "flex items-center justify-between gap-1.5" : "grid justify-items-center gap-1.5"}`}
        >
          <h2 className={panelTitleClassName}>{isOpen ? "Controls" : "Ctl"}</h2>
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
              <h3 className={panelTitleClassName}>Canvas</h3>
              <div className={compactGridClassName}>
                <label className={labelClassName}>
                  Width
                  <input
                    className={fieldClassName}
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

                <label className={labelClassName}>
                  Height
                  <input
                    className={fieldClassName}
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

            <div className={cardClassName}>
              <h3 className={panelTitleClassName}>Sampling</h3>
              <div className={compactGridClassName}>
                <label className={labelClassName}>
                  Sampler
                  <select
                    className={fieldClassName}
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

                <label className={labelClassName}>
                  Scheduler
                  <select
                    className={fieldClassName}
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

                <label className={labelClassName}>
                  Steps
                  <input
                    className={fieldClassName}
                    type="number"
                    min="1"
                    max="150"
                    value={steps}
                    onChange={(event) =>
                      onStepsChange(Number(event.target.value))
                    }
                  />
                </label>

                <label className={labelClassName}>
                  Guidance
                  <input
                    className={fieldClassName}
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

              <label className={labelClassName}>
                Seed
                <input
                  className={fieldClassName}
                  value={seed}
                  onChange={(event) => onSeedChange(event.target.value)}
                  placeholder="Random if blank"
                />
              </label>
            </div>

            <div className={cardClassName}>
              <h3 className={panelTitleClassName}>Run</h3>
              <button
                className="border border-[#2f6fed] bg-[#2f6fed] px-[9px] py-[5px] text-[0.8rem] text-[#f6f8fc] transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy || !prompt.trim()}
                onClick={onGenerate}
                type="button"
              >
                {busy ? "Generating" : "Generate"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid content-start gap-[5px] px-[5px] py-1.5">
            {leftRailItems.map((item) => (
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

      <div
        aria-hidden="true"
        className={getResizerClassName(isOpen)}
        onMouseDown={isOpen ? onResizeStart : undefined}
      />
    </>
  );
}
