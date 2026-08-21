"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { feedbackApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useFeedback(recommendationId: string) {
  return useQuery({
    queryKey: queryKeys.recommendationFeedback(recommendationId),
    queryFn: () => feedbackApi.listForRecommendation(recommendationId),
  });
}

export function useCreateFeedback(recommendationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedback: string) =>
      feedbackApi.create(recommendationId, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendationFeedback(recommendationId),
      });
    },
  });
}
