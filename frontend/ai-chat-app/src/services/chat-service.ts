import { apiClient } from "@/lib/api/client";
import type { ChatApiResponse } from "@/types/chat";

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

export async function sendChatMessage(message: string, conversationId?: string | null) {
  try {
    const response = await apiClient.post<ChatApiResponse>("/chat", {
      message,
      conversation_id: conversationId ?? null,
    });

    return {
      ...response.data,
      reply: response.data.reply || response.data.answer,
    };
  } catch (error: unknown) {
    const detail =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "detail" in error.response.data &&
      typeof error.response.data.detail === "string"
        ? error.response.data.detail
        : "Unable to reach the AI backend right now.";

    throw new ChatApiError(detail);
  }
}
