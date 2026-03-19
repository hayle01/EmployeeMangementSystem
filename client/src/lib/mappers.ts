import type { Employee } from "@/types/employee";
import type { AppUser } from "@/types/user";

interface RawEmployee {
  _id: string;
  empNo: string;
  name: string;
  titleEn: string;
  titleLocal: string;
  department: string;
  mobile: string;
  email?: string | null;
  nationalId: string;
  address: string;
  district: string;
  issueDate: string;
  expireDate: string;
  profileImageUrl?: string | null;
  profileImagePublicId?: string | null;
  qrImageUrl?: string | null;
  qrImagePublicId?: string | null;
  publicSlug: string;
  status: "Active" | "Expired";
  createdAt: string;
  updatedAt: string;
}

interface RawUser {
  _id?: string;
  id?: string;
  username: string;
  role: "admin" | "staff";
  createdAt: string;
  updatedAt: string;
}

export function mapEmployee(raw: unknown): Employee {
  const value = raw as RawEmployee;

  return {
    id: value._id,
    _id: value._id,
    empNo: value.empNo,
    name: value.name,
    titleEn: value.titleEn,
    titleLocal: value.titleLocal,
    email: value.email ?? null,
    department: value.department,
    mobile: value.mobile,
    nationalId: value.nationalId,
    address: value.address,
    district: value.district,
    issueDate: value.issueDate,
    expireDate: value.expireDate,
    profileImageUrl: value.profileImageUrl ?? null,
    profileImagePublicId: value.profileImagePublicId ?? null,
    qrImageUrl: value.qrImageUrl ?? null,
    qrImagePublicId: value.qrImagePublicId ?? null,
    publicSlug: value.publicSlug,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function mapUser(raw: unknown): AppUser {
  const value = raw as RawUser;
  const id = value._id ?? value.id ?? "";

  return {
    id,
    _id: id,
    username: value.username,
    role: value.role,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}