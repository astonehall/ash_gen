import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Frame,
  SlidersHorizontal,
} from "lucide-react";
import { formatOptionLabel } from "../lib/appConfig";

function CollapsibleSection({
  icon: Icon,
  label,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="grid gap-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-1 text-left transition-colors hover:text-txt-1"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 text-txt-3" />}
          <span className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
            {label}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3 w-3 text-txt-3" />
        ) : (
          <ChevronDown className="h-3 w-3 text-txt-3" />
        )}
      </button>
      {open && <div className="grid gap-2 pb-1 pt-1">{children}</div>}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-2xs font-medium text-txt-3">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-7 w-full rounded-sm border border-border bg-surface-0 px-2 text-xs text-txt-1 outline-none transition-colors placeholder:text-txt-3 focus:border-border-focus";

const selectClass =
  "h-7 w-full appearance-none rounded-sm border border-border bg-surface-0 px-2 text-xs text-txt-1 outline-none transition-colors focus:border-border-focus";

function getResizerClassName(isOpen) {
  const base =
    "relative w-1.5 min-h-0 bg-surface-0 max-[900px]:hidden before:absolute before:inset-y-0 before:left-[2px] before:right-[2px] before:transition-colors";
  return isOpen
    ? `${base} cursor-col-resize before:bg-border hover:before:bg-accent`
    : `${base} cursor-default before:bg-surface-2`;
}

export function ControlSidebar({
  availableSchedules,
  collapsedRailWidth,
  generationOptions,
  guidanceScale,
  height,
  isOpen,
  onGuidanceScaleChange,
  onHeightChange,
  onResizeStart,
  onSamplerChange,
  onSeedChange,
  onSigmaScheduleChange,
  onStepsChange,
  onToggle,
  onWidthChange,
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
        className="grid grid-rows-[auto_minmax(0,1fr)] min-h-0 overflow-hidden border-r border-border bg-surface-1"
        style={{
          width: isOpen ? `${width}px` : `${collapsedRailWidth}px`,
        }}
      >
        {/* Panel header */}
        <div className="flex h-8 items-center justify-between border-b border-border px-2">
          {isOpen && (
            <span className="text-2xs font-semibold uppercase tracking-wider text-txt-3">
              Controls
            </span>
          )}
          <button
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-txt-1"
            onClick={onToggle}
            type="button"
            title={isOpen ? "Collapse panel" : "Expand panel"}
          >
            {isOpen ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {isOpen ? (
          <div className="grid min-h-0 content-start gap-1 overflow-auto p-2.5">
            <CollapsibleSection icon={Frame} label="Canvas">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Width">
                  <input
                    className={inputClass}
                    type="number"
                    min="256"
                    max="2048"
                    step="64"
                    value={widthValue}
                    onChange={(e) => onWidthChange(Number(e.target.value))}
                  />
                </Field>
                <Field label="Height">
                  <input
                    className={inputClass}
                    type="number"
                    min="256"
                    max="2048"
                    step="64"
                    value={height}
                    onChange={(e) => onHeightChange(Number(e.target.value))}
                  />
                </Field>
              </div>
            </CollapsibleSection>

            <hr className="border-border" />

            <CollapsibleSection icon={SlidersHorizontal} label="Sampling">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Sampler">
                  <select
                    className={selectClass}
                    value={sampler}
                    onChange={(e) => onSamplerChange(e.target.value)}
                  >
                    {generationOptions.samplers.map((opt) => (
                      <option key={opt} value={opt}>
                        {formatOptionLabel(opt)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Scheduler">
                  <select
                    className={selectClass}
                    value={sigmaSchedule}
                    onChange={(e) => onSigmaScheduleChange(e.target.value)}
                  >
                    {availableSchedules.map((opt) => (
                      <option key={opt} value={opt}>
                        {formatOptionLabel(opt)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Steps">
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="150"
                    value={steps}
                    onChange={(e) => onStepsChange(Number(e.target.value))}
                  />
                </Field>
                <Field label="Guidance">
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="20"
                    step="0.1"
                    value={guidanceScale}
                    onChange={(e) =>
                      onGuidanceScaleChange(Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <Field label="Seed">
                <input
                  className={inputClass}
                  value={seed}
                  onChange={(e) => onSeedChange(e.target.value)}
                  placeholder="Random if blank"
                />
              </Field>
            </CollapsibleSection>
          </div>
        ) : (
          <div className="grid content-start gap-1 p-1">
            {[
              { icon: Frame, title: "Canvas" },
              { icon: SlidersHorizontal, title: "Sampling" },
            ].map((item) => (
              <button
                className="flex h-8 w-full items-center justify-center rounded-sm text-txt-3 transition-colors hover:bg-surface-3 hover:text-txt-1"
                key={item.title}
                onClick={onToggle}
                title={item.title}
                type="button"
              >
                <item.icon className="h-4 w-4" />
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
