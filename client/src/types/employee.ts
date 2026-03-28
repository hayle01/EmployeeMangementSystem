export type EmployeeHistoryActionType = "update" | "renew";

export interface Employee {
  id: string;
  _id: string;
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email: string | null;
  nationalId: string;
  address: string;
  district: string;
  issueDate: string;
  expireDate: string;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
  qrImageUrl: string | null;
  qrImagePublicId: string | null;
  publicSlug: string;
  history: EmployeeHistoryItem[];
  status: "Active" | "Expired";
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  district?: string;
  status?: "Active" | "Expired" | "";
}

export interface CreateEmployeeInput {
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email?: string;
  nationalId: string;
  address: string;
  district: string;
  issueDate: string;
  expireDate: string;
  profileImage?: File | null;
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {
  id: string;
}

export interface RenewEmployeeInput {
  id: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email?: string;
  nationalId: string;
  address: string;
  district: string;
  issueDate: string;
  expireDate: string;
  profileImage?: File | null;
}

export interface EmployeeHistoryItem {
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  nationalId: string;
  address: string;
  email: string | null;
  district: string;
  issueDate: string;
  expireDate: string;
  profileImageUrl: string | null;
  qrImageUrl: string | null;
  publicSlug: string;
  actionType?: EmployeeHistoryActionType;
  statusAtThatTime: "Active" | "Expired";
  recordedAt: string;
}

export interface EmployeeHistoryResponse {
  employeeId: string;
  empNo: string;
  name: string;
  publicSlug: string;
  updatedAt: string;
  history: EmployeeHistoryItem[];
}