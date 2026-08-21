import { apiClient } from "./client";
import type { FeedbackCreate, FeedbackRead } from "@/types";

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
};
