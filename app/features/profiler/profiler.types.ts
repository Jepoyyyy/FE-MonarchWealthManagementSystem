export interface QuestionnaireOption {
  label: string;
  score: number;
}

export interface QuestionnaireQuestion {
  question: string;
  options: QuestionnaireOption[];
}

export interface QuestionnaireAnswerDTO {
  questionnaireAnswer: string;
  score: number;
}

export interface ProfilerSubmissionDTO {
  answers: QuestionnaireAnswerDTO[];
}

export interface ProfilerResultDTO {
  id: string;
  risk_profile: "risk_averse" | "moderate" | "risk_taker";
  questionnaire_completed: boolean;
  updated_at: string;
  score: number;
}
