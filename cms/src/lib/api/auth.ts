import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, LoginPayload, User } from "@/types/auth";

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMeApi(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Allow local sign-out even if network disconnects
  }
}
