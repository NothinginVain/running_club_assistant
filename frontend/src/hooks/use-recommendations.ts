"use client";

import { useQuery } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => recommendationsApi.list(),
  });
}

export function useFavoriteRecommendations() {
  return useQuery({
    queryKey: queryKeys.favoriteRecommendations,
    queryFn: () => recommendationsApi.listFavorites(),
  });
}

export function useRecommendation(recommendationId: string | null) {
  return useQuery({
    queryKey: queryKeys.recommendation(recommendationId ?? "none"),
    queryFn: () => recommendationsApi.get(recommendationId as string),
    enabled: Boolean(recommendationId),
  });
}
