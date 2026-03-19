import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { mapUser } from "@/lib/mappers";
import type { AppUser, CreateUserInput } from "@/types/user";

export const userApi = {
  async list(): Promise<AppUser[]> {
    const { data } = await apiClient.get<unknown[]>(endpoints.users.list);
    return data.map(mapUser);
  },

  async create(input: CreateUserInput): Promise<AppUser> {
    const { data } = await apiClient.post<unknown>(endpoints.users.create, input);
    return mapUser(data);
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(endpoints.users.delete(id));
    return data;
  },
};