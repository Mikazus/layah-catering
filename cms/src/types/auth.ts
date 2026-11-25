export type UserRole = "customer" | "kitchen" | "driver" | "management";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  initials: string;
  title?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
