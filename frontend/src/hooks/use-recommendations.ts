"use client";

import { useQuery } from "@tanstack/react-query";

import { recommendationsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useRecommendations(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.recommendations(userId ?? "none"),
    queryFn: () => recommendationsApi.listForUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useFavoriteRecommendations(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.favoriteRecommendations(userId ?? "none"),
    queryFn: () => recommendationsApi.listFavoritesForUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useRecommendation(recommendationId: string | null) {
  return useQuery({
    queryKey: queryKeys.recommendation(recommendationId ?? "none"),
    queryFn: () => recommendationsApi.get(recommendationId as string),
    enabled: Boolean(recommendationId),
  });
}
