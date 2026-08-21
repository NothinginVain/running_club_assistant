import { Calendar } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import {
  EXPERIENCE_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  TARGET_DISTANCE_OPTIONS,
} from "@/lib/survey-options";
import type { RunningPlanSurveyAnswers, SurveyRead } from "@/types";

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function SurveyCard({ survey }: { survey: SurveyRead }) {
  const answers = survey.answers as RunningPlanSurveyAnswers;

  return (
    <Link href={`/survey/${survey.id}`} className="block">
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="space-y-0">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" aria-hidden="true" />
            {formatDate(survey.created_at)}
          </p>
          <h3 className="font-medium leading-snug">
            {labelFor(GOAL_OPTIONS, answers.goal)}
          </h3>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide">Target</p>
            <p className="text-foreground">
              {labelFor(TARGET_DISTANCE_OPTIONS, answers.target_distance)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Experience</p>
            <p className="text-foreground">
              {labelFor(EXPERIENCE_LEVEL_OPTIONS, answers.experience_level)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Runs / week</p>
            <p className="text-foreground">{answers.runs_per_week}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Duration</p>
            <p className="text-foreground">{answers.plan_duration_weeks} weeks</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
