export function getEmployeeStatus(expireDate: Date | string): "Active" | "Expired" {
  return new Date(expireDate) >= new Date() ? "Active" : "Expired";
}