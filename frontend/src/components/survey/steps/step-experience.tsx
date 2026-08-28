"use client";

import { EnumSelectField } from "@/components/survey/enum-select-field";
import { NumberField } from "@/components/survey/number-field";
import { EXPERIENCE_LEVEL_OPTIONS, RUNS_PER_WEEK_OPTIONS } from "@/lib/survey-options";

const RUNS_PER_WEEK_SELECT_OPTIONS = RUNS_PER_WEEK_OPTIONS.map((runs) => ({
  value: String(runs),
  label: `${runs} run${runs === 1 ? "" : "s"} per week`,
}));

export function StepExperience() {
  return (
    <div className="space-y-5">
      <EnumSelectField
        name="experience_level"
        label="Running experience"
        options={EXPERIENCE_LEVEL_OPTIONS}
        info="Sets how conservative or ambitious your plan's pacing and week-to-week progression should be."
      />
      <NumberField
        name="current_weekly_distance_km"
        label="Current weekly distance"
        min={0}
        step={0.5}
        suffix="km"
        info="Your typical total running distance right now — the safe starting point your plan builds up from."
      />
      <EnumSelectField
        name="runs_per_week"
        label="Runs per week"
        options={RUNS_PER_WEEK_SELECT_OPTIONS}
        numeric
        info="How many separate running sessions you want scheduled per week."
      />
      <NumberField
        name="longest_recent_run_km"
        label="Longest recent run"
        min={0}
        step={0.5}
        suffix="km"
        info="The longest single run you've done recently — helps avoid jumping your long run too far too fast."
      />
    </div>
  );
}
