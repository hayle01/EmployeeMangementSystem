import { z } from "zod";

export const employeeSchema = z.object({
  empNo: z.string().min(1, "Employee number is required").trim(),
  name: z.string().min(1, "Name is required").trim(),
  titleEn: z.string().min(1, "English title is required").trim(),
  titleLocal: z.string().min(1, "Local title is required").trim(),
  department: z.string().min(1, "Department is required").trim(),
  mobile: z.string().min(1, "Mobile is required").trim(),
  email: z.string().email("Valid email is required").trim(),
  nationalId: z.string().min(1, "National ID is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  district: z.string().min(1, "District is required").trim(),
  issueDate: z.string().min(1, "Issue date is required"),
  expireDate: z.string().min(1, "Expire date is required"),
});