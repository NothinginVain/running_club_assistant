"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeedback } from "@/hooks/use-feedback";
import { FEEDBACK_MAX_LENGTH } from "@/types/feedback";
import { ApiError } from "@/types/api";

export function FeedbackForm({ recommendationId }: { recommendationId: string }) {
  const [feedback, setFeedback] = useState("");
  const mutation = useCreateFeedback(recommendationId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = feedback.trim();
    if (!trimmed) return;

    mutation.mutate(trimmed, {
      onSuccess: () => {
        setFeedback("");
        toast.success("Feedback added.");
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't save your feedback.",
        );
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        maxLength={FEEDBACK_MAX_LENGTH}
        placeholder="How did this plan feel? What would you like adjusted?"
        rows={3}
        aria-label="Feedback"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {feedback.length}/{FEEDBACK_MAX_LENGTH}
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || feedback.trim().length === 0}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Send feedback
        </Button>
      </div>
    </form>
  );
}
