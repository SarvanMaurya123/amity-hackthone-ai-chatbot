import { apiClient } from "@/lib/api/client";
import type { Conversation, ConversationListResponse } from "@/types/conversation";

export const conversationService = {
  async list(): Promise<Conversation[]> {
    const response = await apiClient.get<ConversationListResponse>("/conversations");
    return response.data.conversations;
  },

  async create(title = "New Chat"): Promise<Conversation> {
    const response = await apiClient.post<Conversation>("/conversations", { title });
    return response.data;
  },

  async addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>(`/conversations/${conversationId}/messages`, {
      role,
      content,
      is_streaming: false,
    });
    return response.data;
  },

  async update(conversationId: string, payload: { title?: string; pinned?: boolean }): Promise<Conversation> {
    const response = await apiClient.patch<Conversation>(`/conversations/${conversationId}`, payload);
    return response.data;
  },

  async remove(conversationId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}`);
  },

  async clear(): Promise<void> {
    await apiClient.delete("/conversations");
  },
};
