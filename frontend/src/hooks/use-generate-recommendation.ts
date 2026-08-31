"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

// Plan generation/revision involves two sequential LLM calls and has been
// observed taking 90-110s+ under load. Without a client-side ceiling, a
// genuinely stuck request just hangs forever with no way for the user to
// recover short of leaving the page. This gives it generous room to
// complete normally, but guarantees it eventually surfaces the existing
// retry UI instead of waiting indefinitely.
const GENERATION_TIMEOUT_MS = 180_000;

export function useGenerateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      recommendationsApi.generate(AbortSignal.timeout(GENERATION_TIMEOUT_MS)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}

export function useReviseRecommendation(recommendationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      recommendationsApi.reviseFromFeedback(
        recommendationId,
        AbortSignal.timeout(GENERATION_TIMEOUT_MS),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}
