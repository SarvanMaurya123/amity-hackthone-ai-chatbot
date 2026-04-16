import { apiClient } from "@/lib/api/client";
import type { ApiHealthResponse, ChatHealthResponse } from "@/types/system";

export const systemService = {
  async apiHealth(): Promise<ApiHealthResponse> {
    const response = await apiClient.get<ApiHealthResponse>("/health");
    return response.data;
  },

  async chatHealth(): Promise<ChatHealthResponse> {
    const response = await apiClient.get<ChatHealthResponse>("/chat/health");
    return response.data;
  },
};
