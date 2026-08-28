import { apiClient } from "./client";
import type { FeedbackCreate, FeedbackRead, HealthUpdateCreate } from "@/types";

export const feedbackApi = {
  create: (recommendationId: string, data: FeedbackCreate) =>
    apiClient.post<FeedbackRead>(
      `/recommendations/${recommendationId}/feedback`,
      data,
    ),

  listForRecommendation: (recommendationId: string) =>
    apiClient.get<FeedbackRead[]>(
      `/recommendations/${recommendationId}/feedback`,
    ),

  createHealthUpdate: (recommendationId: string, data: HealthUpdateCreate) =>
    apiClient.post<FeedbackRead>(
      `/recommendations/${recommendationId}/health-update`,
      data,
    ),
};
