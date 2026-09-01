import { formatDate } from "@/lib/format";
import {
  DETAIL_LEVEL_OPTIONS,
  DIET_TYPE_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  ISSUE_AREA_OPTIONS,
  MAIN_PREFERENCE_OPTIONS,
  MEDICALLY_CLEARED_ACTIVITY_OPTIONS,
  RECOVERY_LEVEL_OPTIONS,
  SLEEP_DURATION_OPTIONS,
  STRESS_LEVEL_OPTIONS,
  TARGET_DISTANCE_OPTIONS,
  TERRAIN_OPTIONS,
  WEEKDAY_OPTIONS,
  type SelectOption,
} from "@/lib/survey-options";
import type { RunningPlanSurveyAnswers, SurveyRead } from "@/types";

function labelFor(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function labelsFor(options: SelectOption[], values: string[]): string {
  return values.map((value) => labelFor(options, value)).join(", ");
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>
    </section>
  );
}

export function SurveyDetail({ survey }: { survey: SurveyRead }) {
  const a = survey.answers as RunningPlanSurveyAnswers;

  return (
    <div className="space-y-8">
      <Section title="Goals & timeline">
        <Field label="Goal" value={labelFor(GOAL_OPTIONS, a.goal)} />
        <Field
          label="Target distance"
          value={labelFor(TARGET_DISTANCE_OPTIONS, a.target_distance)}
        />
        <Field label="Plan length" value={`${a.plan_duration_weeks} weeks`} />
        <Field label="Start date" value={formatDate(a.plan_start_date)} />
        {a.target_event_date && (
          <Field label="Target event date" value={formatDate(a.target_event_date)} />
        )}
      </Section>

      <Section title="Experience & volume">
        <Field
          label="Experience level"
          value={labelFor(EXPERIENCE_LEVEL_OPTIONS, a.experience_level)}
        />
        <Field
          label="Current weekly distance"
          value={`${a.current_weekly_distance_km} km`}
        />
        <Field label="Runs per week" value={String(a.runs_per_week)} />
        <Field label="Longest recent run" value={`${a.longest_recent_run_km} km`} />
      </Section>

      <Section title="Schedule">
        <Field
          label="Training days"
          value={labelsFor(WEEKDAY_OPTIONS, a.preferred_training_days)}
        />
        <Field
          label="Long-run day"
          value={
            a.preferred_long_run_day
              ? labelFor(WEEKDAY_OPTIONS, a.preferred_long_run_day)
              : "No long run"
          }
        />
        <Field label="Max session" value={`${a.max_session_minutes} minutes`} />
        <Field label="Terrain" value={labelFor(TERRAIN_OPTIONS, a.preferred_terrain)} />
        <Field
          label="Equipment"
          value={labelsFor(EQUIPMENT_OPTIONS, a.available_equipment)}
        />
      </Section>

      <Section title="Health">
        <Field
          label="Issue areas"
          value={labelsFor(ISSUE_AREA_OPTIONS, a.current_issue_areas)}
        />
        <Field label="Pain level" value={`${a.current_pain_level}/10`} />
        <Field
          label="Medically cleared for"
          value={
            a.medically_cleared_activities && a.medically_cleared_activities.length > 0
              ? labelsFor(
                  MEDICALLY_CLEARED_ACTIVITY_OPTIONS,
                  a.medically_cleared_activities,
                )
              : "Not reported"
          }
        />
        <Field
          label="Recovery"
          value={labelFor(RECOVERY_LEVEL_OPTIONS, a.recovery_level)}
        />
        <Field
          label="Sleep"
          value={labelFor(SLEEP_DURATION_OPTIONS, a.average_sleep_duration)}
        />
        <Field label="Stress" value={labelFor(STRESS_LEVEL_OPTIONS, a.stress_level)} />
      </Section>

      <Section title="Preferences">
        <Field label="Diet" value={labelFor(DIET_TYPE_OPTIONS, a.diet_type)} />
        {a.weight_kg && <Field label="Weight" value={`${a.weight_kg} kg`} />}
        <Field
          label="Main preference"
          value={labelFor(MAIN_PREFERENCE_OPTIONS, a.main_preference)}
        />
        <Field
          label="Detail level"
          value={labelFor(DETAIL_LEVEL_OPTIONS, a.detail_level)}
        />
      </Section>
    </div>
  );
}
