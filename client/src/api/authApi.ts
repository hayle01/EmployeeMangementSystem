import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(endpoints.auth.login, payload);
    return data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      endpoints.auth.changePassword,
      payload,
    );
    return data;
  },
};