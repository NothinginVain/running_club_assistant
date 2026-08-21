export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  surveys: ["surveys"] as const,
  latestSurvey: ["surveys", "latest"] as const,
  survey: (surveyId: string) => ["surveys", surveyId] as const,
  recommendations: ["recommendations"] as const,
  favoriteRecommendations: ["recommendations", "favorites"] as const,
  recommendation: (recommendationId: string) =>
    ["recommendation", recommendationId] as const,
  recommendationFeedback: (recommendationId: string) =>
    ["recommendation", recommendationId, "feedback"] as const,
  chatHistory: ["chat", "history"] as const,
};
