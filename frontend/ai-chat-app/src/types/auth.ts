export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  organization?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name: string;
  organization?: string;
}
