"use client";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyDetail } from "@/components/survey/survey-detail";
import { useDeleteSurvey, useSurvey } from "@/hooks/use-survey";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/types/api";

export default function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { data: survey, isLoading, isError } = useSurvey(id);
  const deleteSurvey = useDeleteSurvey();

  function handleDelete() {
    deleteSurvey.mutate(id, {
      onSuccess: () => {
        toast.success("Survey deleted.");
        router.push("/survey");
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't delete this survey.",
        );
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div className="space-y-4">
        <Link href="/survey" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-1 inline size-3.5" />
          Back to survey history
        </Link>
        <Alert variant="destructive">
          <AlertDescription>We couldn&apos;t find that survey.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/survey" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-1 inline size-3.5" />
          Back to survey history
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Survey details</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted {formatDate(survey.created_at)}
              {survey.deleted_at && " · Deleted"}
            </p>
          </div>

          {!survey.deleted_at && (
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                <Trash2 className="size-4" />
                Delete
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete this survey?</DialogTitle>
                  <DialogDescription>
                    This removes it from your survey history. Plans already
                    generated from it are not affected.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteSurvey.isPending}
                  >
                    {deleteSurvey.isPending && <Loader2 className="size-4 animate-spin" />}
                    Delete survey
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <SurveyDetail survey={survey} />
    </div>
  );
}
