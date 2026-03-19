import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/api/employeeApi";
import type {
  CreateEmployeeInput,
  EmployeeFilters,
  UpdateEmployeeInput,
} from "@/types/employee";

export type { Employee } from "@/types/employee";

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => employeeApi.list(filters),
  });
}

export function useEmployee(id?: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useEmployeeHistory(id?: string) {
  return useQuery({
    queryKey: ["employee-history", id],
    queryFn: () => employeeApi.getHistory(id as string),
    enabled: Boolean(id),
  });
}

export function useEmployeeBySlug(slug?: string) {
  return useQuery({
    queryKey: ["employee-public", slug],
    queryFn: () => employeeApi.getPublic(slug as string),
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeeApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeeApi.update(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["employee-history", variables.id] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}