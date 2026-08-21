export const queryKeys = {
  user: (userId: string) => ["user", userId] as const,
  latestSurvey: (userId: string) => ["surveys", "latest", userId] as const,
  recommendations: (userId: string) =>
    ["recommendations", "user", userId] as const,
  favoriteRecommendations: (userId: string) =>
    ["recommendations", "user", userId, "favorites"] as const,
  recommendation: (recommendationId: string) =>
    ["recommendation", recommendationId] as const,
  recommendationFeedback: (recommendationId: string) =>
    ["recommendation", recommendationId, "feedback"] as const,
  chatHistory: (userId: string) => ["chat", "history", userId] as const,
};
