import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { mapEmployee } from "@/lib/mappers";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeFilters,
  EmployeeHistoryResponse,
  RenewEmployeeInput,
  UpdateEmployeeInput,
} from "@/types/employee";

function buildEmployeeFormData(
  input: CreateEmployeeInput | UpdateEmployeeInput,
): FormData {
  const formData = new FormData();

  formData.append("empNo", input.empNo);
  formData.append("name", input.name);
  formData.append("titleEn", input.titleEn);
  formData.append("titleLocal", input.titleLocal);
  formData.append("department", input.department);
  formData.append("mobile", input.mobile);
  formData.append("nationalId", input.nationalId);
  formData.append("address", input.address);
  formData.append("district", input.district);
  formData.append("issueDate", input.issueDate);
  formData.append("expireDate", input.expireDate);

  if (input.email?.trim()) {
    formData.append("email", input.email.trim());
  }

  if (input.profileImage) {
    formData.append("profileImage", input.profileImage);
  }

  return formData;
}

function buildRenewFormData(input: RenewEmployeeInput): FormData {
  const formData = new FormData();

  formData.append("titleEn", input.titleEn);
  formData.append("titleLocal", input.titleLocal);
  formData.append("department", input.department);
  formData.append("mobile", input.mobile);
  formData.append("nationalId", input.nationalId);
  formData.append("address", input.address);
  formData.append("district", input.district);
  formData.append("issueDate", input.issueDate);
  formData.append("expireDate", input.expireDate);

  if (input.email?.trim()) {
    formData.append("email", input.email.trim());
  }

  if (input.profileImage) {
    formData.append("profileImage", input.profileImage);
  }

  return formData;
}

export const employeeApi = {
  async list(filters?: EmployeeFilters): Promise<Employee[]> {
    const { data } = await apiClient.get<unknown[]>(endpoints.employees.list, {
      params: {
        search: filters?.search || undefined,
        department: filters?.department || undefined,
        district: filters?.district || undefined,
        status: filters?.status || undefined,
      },
    });

    return data.map(mapEmployee);
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await apiClient.get<unknown>(
      endpoints.employees.detail(id),
    );
    return mapEmployee(data);
  },

  async getHistory(id: string): Promise<EmployeeHistoryResponse> {
    const { data } = await apiClient.get<EmployeeHistoryResponse>(
      endpoints.employees.history(id),
    );
    return data;
  },

  async getPublic(slug: string): Promise<Employee> {
    const { data } = await apiClient.get<unknown>(
      endpoints.employees.public(slug),
    );
    return mapEmployee(data);
  },

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const formData = buildEmployeeFormData(input);

    const { data } = await apiClient.post<unknown>(
      endpoints.employees.create,
      formData,
    );

    return mapEmployee(data);
  },

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    const formData = buildEmployeeFormData(input);

    const { data } = await apiClient.put<unknown>(
      endpoints.employees.update(input.id),
      formData,
    );

    return mapEmployee(data);
  },

  async renew(input: RenewEmployeeInput): Promise<Employee> {
    const formData = buildRenewFormData(input);

    const { data } = await apiClient.patch<unknown>(
      endpoints.employees.renew(input.id),
      formData,
    );

    return mapEmployee(data);
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      endpoints.employees.delete(id),
    );
    return data;
  },
};