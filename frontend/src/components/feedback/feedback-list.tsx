import { formatDate } from "@/lib/format";
import type { FeedbackRead } from "@/types";

export function FeedbackList({ feedback }: { feedback: FeedbackRead[] }) {
  if (feedback.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No feedback yet. Share how this plan is going below.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {feedback.map((entry) => (
        <li key={entry.id} className="rounded-md border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
          <p className="mt-1 text-sm">{entry.feedback}</p>
        </li>
      ))}
    </ul>
  );
}
