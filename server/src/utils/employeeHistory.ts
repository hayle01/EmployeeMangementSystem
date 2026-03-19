import {
  IEmployeeDocument,
  IEmployeeHistoryItem,
  EmployeeHistoryActionType,
} from "../models/Employee";

export function buildEmployeeHistorySnapshot(
  employee: IEmployeeDocument,
  actionType: EmployeeHistoryActionType = "update",
): IEmployeeHistoryItem {
  return {
    empNo: employee.empNo,
    name: employee.name,
    titleEn: employee.titleEn,
    titleLocal: employee.titleLocal,
    department: employee.department,
    mobile: employee.mobile,
    email: employee.email ?? null,
    nationalId: employee.nationalId,
    address: employee.address,
    district: employee.district,
    issueDate: employee.issueDate,
    expireDate: employee.expireDate,
    profileImageUrl: employee.profileImageUrl ?? null,
    qrImageUrl: employee.qrImageUrl ?? null,
    publicSlug: employee.publicSlug,
    actionType,
    statusAtThatTime:
      new Date(employee.expireDate) >= new Date() ? "Active" : "Expired",
    recordedAt: new Date(),
  };
}