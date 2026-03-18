import { Frame, SlidersHorizontal } from "lucide-react";
import { FieldControl } from "../FieldControl";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { formatOptionLabel } from "../../lib/appConfig";

export const CONTROL_SECTION_META = {
  canvas: { icon: Frame, label: "Canvas" },
  sampling: { icon: SlidersHorizontal, label: "Sampling" },
};

export function ControlSectionContent({
  availableSchedules,
  generationOptions,
  guidanceScale,
  height,
  onGuidanceScaleChange,
  onHeightChange,
  onSamplerChange,
  onSeedChange,
  onSigmaScheduleChange,
  onStepsChange,
  onWidthChange,
  sampler,
  seed,
  sectionId,
  sigmaSchedule,
  steps,
  widthValue,
}) {
  if (sectionId === "canvas") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <FieldControl label="Width">
          <Input
            type="number"
            min="256"
            max="2048"
            step="64"
            value={widthValue}
            onChange={(e) => onWidthChange(Number(e.target.value))}
          />
        </FieldControl>
        <FieldControl label="Height">
          <Input
            type="number"
            min="256"
            max="2048"
            step="64"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
          />
        </FieldControl>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <FieldControl label="Sampler">
          <Select
            value={sampler}
            onChange={(e) => onSamplerChange(e.target.value)}
          >
            {generationOptions.samplers.map((opt) => (
              <option key={opt} value={opt}>
                {formatOptionLabel(opt)}
              </option>
            ))}
          </Select>
        </FieldControl>
        <FieldControl label="Scheduler">
          <Select
            value={sigmaSchedule}
            onChange={(e) => onSigmaScheduleChange(e.target.value)}
          >
            {availableSchedules.map((opt) => (
              <option key={opt} value={opt}>
                {formatOptionLabel(opt)}
              </option>
            ))}
          </Select>
        </FieldControl>
        <FieldControl label="Steps">
          <Input
            type="number"
            min="1"
            max="150"
            value={steps}
            onChange={(e) => onStepsChange(Number(e.target.value))}
          />
        </FieldControl>
        <FieldControl label="Guidance">
          <Input
            type="number"
            min="1"
            max="20"
            step="0.1"
            value={guidanceScale}
            onChange={(e) => onGuidanceScaleChange(Number(e.target.value))}
          />
        </FieldControl>
      </div>
      <FieldControl label="Seed" description="Leave empty for random">
        <Input
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
          placeholder="Random if blank"
        />
      </FieldControl>
    </>
  );
}
