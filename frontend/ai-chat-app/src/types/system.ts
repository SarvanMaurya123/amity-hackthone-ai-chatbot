export interface ApiHealthResponse {
  status: string;
  app_name: string;
  mongodb_connected: boolean;
  api_prefix: string;
}

export interface ChatHealthResponse {
  status: string;
  primary_model_ready: boolean;
  llm_configured: boolean;
}
