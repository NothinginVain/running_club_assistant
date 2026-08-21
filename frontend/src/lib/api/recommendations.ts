import { apiClient } from "./client";
import type {
  RecommendationFavoriteUpdate,
  RecommendationRatingUpdate,
  RecommendationRead,
} from "@/types";

export const recommendationsApi = {
  generateForUser: (userId: string) =>
    apiClient.post<RecommendationRead>(`/recommendations/generate/${userId}`),

  listForUser: (userId: string) =>
    apiClient.get<RecommendationRead[]>(`/recommendations/user/${userId}`),

  listFavoritesForUser: (userId: string) =>
    apiClient.get<RecommendationRead[]>(
      `/recommendations/user/${userId}/favorites`,
    ),

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

  reviseFromFeedback: (recommendationId: string) =>
    apiClient.post<RecommendationRead>(
      `/recommendations/${recommendationId}/revise`,
    ),
};
