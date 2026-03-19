export type UserRole = "admin" | "staff";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}