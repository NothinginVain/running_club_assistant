import type { MedicallyClearedActivity } from "./enums";

export interface FeedbackCreate {
  feedback: string;
}

export interface FeedbackRead {
  id: string;
  feedback: string;
  user_id: string;
  recommendation_id: string;
  created_at: string;
}

export const FEEDBACK_MAX_LENGTH = 2000;

export type WarningSymptom =
  | "swelling"
  | "restricted_movement"
  | "abnormal_walking"
  | "worsening_daily"
  | "none";

export type WalkingSymptomResponse =
  | "no_increase"
  | "symptoms_increase"
  | "not_tried";

export type ProfessionalClearanceStatus =
  | "not_assessed"
  | "not_cleared"
  | "cleared";

export interface HealthUpdateCreate {
  current_pain_level: number;
  warning_symptoms: WarningSymptom[];
  walking_symptom_response: WalkingSymptomResponse;
  professional_clearance_status: ProfessionalClearanceStatus;
  medically_cleared_activities: MedicallyClearedActivity[] | null;
  has_additional_restrictions: boolean;
}
