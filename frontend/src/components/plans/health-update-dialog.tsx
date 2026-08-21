"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeedback } from "@/hooks/use-feedback";
import { ApiError } from "@/types/api";

function buildHealthUpdateText(questions: string[], answers: string[]): string {
  const parts = [
    "Health update after a reported injury or health concern:",
    ...questions.map(
      (question, index) => `${index + 1}. ${question}\nAnswer: ${answers[index]}`,
    ),
  ];

  return parts.join("\n\n");
}

export function HealthUpdateDialog({
  recommendationId,
  questions,
  open,
  onOpenChange,
}: {
  recommendationId: string;
  questions: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const createFeedback = useCreateFeedback(recommendationId);

  const canSubmit = answers.every((answer) => answer.trim().length > 0);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    createFeedback.mutate(buildHealthUpdateText(questions, answers), {
      onSuccess: () => {
        toast.success(
          "Health update saved. Automatic revision stays paused until a coach reviews it.",
        );
        onOpenChange(false);
        setAnswers(questions.map(() => ""));
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't save your health update.",
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Health update needed</DialogTitle>
          <DialogDescription>
            For your safety, we need a few details before your coach can
            review any plan changes. This won&apos;t generate a new plan
            automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question, index) => (
            <div key={question} className="space-y-1.5">
              <Label htmlFor={`health-question-${index}`}>{question}</Label>
              <Textarea
                id={`health-question-${index}`}
                value={answers[index]}
                onChange={(event) =>
                  setAnswers((current) => {
                    const next = [...current];
                    next[index] = event.target.value;
                    return next;
                  })
                }
                rows={2}
              />
            </div>
          ))}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createFeedback.isPending}>
              {createFeedback.isPending && <Loader2 className="size-4 animate-spin" />}
              Save health update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
