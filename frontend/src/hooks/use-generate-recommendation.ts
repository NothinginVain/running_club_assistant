"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGenerateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recommendationsApi.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}

export function useReviseRecommendation(recommendationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recommendationsApi.reviseFromFeedback(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}
