import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import type { CreateUserInput } from "@/types/user";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: userApi.list,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => userApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}