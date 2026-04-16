export type MessageRole = "user" | "assistant";

export interface MessageMetadata {
  source?: "pkl_model" | "llm" | "rule_based";
  detected_language?: string;
  language_style?: string;
  model_used?: string;
  used_fallback?: boolean;
  risk_level?: string;
  support_themes?: string[];
  memory_summary?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  is_streaming?: boolean;
  metadata?: MessageMetadata | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}
