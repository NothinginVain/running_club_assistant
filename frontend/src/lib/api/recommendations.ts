import { apiClient } from "./client";
import type {
  RecommendationFavoriteUpdate,
  RecommendationRatingUpdate,
  RecommendationRead,
} from "@/types";

export const recommendationsApi = {
  generate: (signal?: AbortSignal) =>
    apiClient.post<RecommendationRead>("/recommendations/generate", undefined, signal),

  list: () => apiClient.get<RecommendationRead[]>("/recommendations/"),

  listFavorites: () =>
    apiClient.get<RecommendationRead[]>("/recommendations/favorites"),

  get: (recommendationId: string) =>
    apiClient.get<RecommendationRead>(`/recommendations/${recommendationId}`),

  updateRating: (recommendationId: string, data: RecommendationRatingUpdate) =>
    apiClient.patch<RecommendationRead>(
      `/recommendations/${recommendationId}/rating`,
      data,
    ),

  updateFavorite: (
    recommendationId: string,
    data: RecommendationFavoriteUpdate,
  ) =>
    apiClient.patch<RecommendationRead>(
      `/recommendations/${recommendationId}/favorite`,
      data,
    ),

  remove: (recommendationId: string) =>
    apiClient.delete<void>(`/recommendations/${recommendationId}`),

  reviseFromFeedback: (recommendationId: string, signal?: AbortSignal) =>
    apiClient.post<RecommendationRead>(
      `/recommendations/${recommendationId}/revise`,
      undefined,
      signal,
    ),
};
