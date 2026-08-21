"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { RecommendationRead } from "@/types";

export function useToggleFavorite(recommendationId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.recommendation(recommendationId);

  return useMutation({
    mutationFn: (isFavorite: boolean) =>
      recommendationsApi.updateFavorite(recommendationId, { is_favorite: isFavorite }),
    onMutate: async (isFavorite) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RecommendationRead>(key);

      if (previous) {
        queryClient.setQueryData<RecommendationRead>(key, {
          ...previous,
          is_favorite: isFavorite,
        });
      }

      return { previous };
    },
    onError: (_error, _isFavorite, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdateRating(recommendationId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.recommendation(recommendationId);

  return useMutation({
    mutationFn: (rating: number) =>
      recommendationsApi.updateRating(recommendationId, { feedback_rating: rating }),
    onMutate: async (rating) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RecommendationRead>(key);

      if (previous) {
        queryClient.setQueryData<RecommendationRead>(key, {
          ...previous,
          feedback_rating: rating,
        });
      }

      return { previous };
    },
    onError: (_error, _rating, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
