"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useGenerateRecommendation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recommendationsApi.generateForUser(userId as string),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(userId) });
    },
  });
}

export function useReviseRecommendation(recommendationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recommendationsApi.reviseFromFeedback(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
