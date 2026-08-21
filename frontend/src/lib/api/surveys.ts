import { apiClient } from "./client";
import { RecommendationType } from "@/types";
import type {
  RunningPlanSurveyAnswers,
  SurveyRead,
  SurveyUpdate,
} from "@/types";

export const surveysApi = {
  createRunningPlanSurvey: (userId: string, answers: RunningPlanSurveyAnswers) =>
    apiClient.post<SurveyRead>(`/surveys/users/${userId}`, {
      survey_type: RecommendationType.RUNNING_PLAN,
      answers,
    }),

  getLatestForUser: (userId: string) =>
    apiClient.get<SurveyRead>(`/surveys/users/${userId}/latest`),

  listForUser: (userId: string) =>
    apiClient.get<SurveyRead[]>(`/surveys/users/${userId}`),

  get: (surveyId: string) => apiClient.get<SurveyRead>(`/surveys/${surveyId}`),

  update: (surveyId: string, data: SurveyUpdate) =>
    apiClient.patch<SurveyRead>(`/surveys/${surveyId}`, data),

  remove: (surveyId: string) => apiClient.delete<void>(`/surveys/${surveyId}`),
};
