import type { Conversation } from "@/types/conversation";

export interface ModelPrediction {
  label: string;
  confidence: number;
}

export interface ChatApiResponse {
  reply: string;
  answer: string;
  source: "pkl_model" | "llm" | "rule_based";
  detected_language: string;
  language_style: string;
  primary_prediction: ModelPrediction;
  secondary_prediction?: ModelPrediction | null;
  tertiary_prediction?: ModelPrediction | null;
  model_used: string;
  used_fallback: boolean;
  conversation: Conversation;
}
