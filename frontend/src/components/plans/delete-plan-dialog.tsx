"use client";

import { Loader2 } from "lucide-react";
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
import { useDeleteRecommendation } from "@/hooks/use-recommendation-actions";
import { ApiError } from "@/types/api";

export function DeletePlanDialog({
  recommendationId,
  open,
  onOpenChange,
  onDeleted,
}: {
  recommendationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const deleteRecommendation = useDeleteRecommendation(recommendationId);

  function handleDelete() {
    deleteRecommendation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Plan deleted.");
        onOpenChange(false);
        onDeleted();
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't delete this plan.",
        );
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete this plan?</DialogTitle>
          <DialogDescription>
            This permanently deletes the plan and its feedback history. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteRecommendation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRecommendation.isPending}
          >
            {deleteRecommendation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
