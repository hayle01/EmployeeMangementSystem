import { z } from "zod";

const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Valid email is required",
  });

export const employeeSchema = z
  .object({
    empNo: z.string().min(1, "Employee number is required").trim(),
    name: z.string().min(1, "Name is required").trim(),
    titleEn: z.string().min(1, "English title is required").trim(),
    titleLocal: z.string().min(1, "Local title is required").trim(),
    department: z.string().min(1, "Department is required").trim(),
    mobile: z.string().min(1, "Mobile is required").trim(),
    email: optionalEmailSchema,
    nationalId: z.string().min(1, "National ID is required").trim(),
    address: z.string().min(1, "Address is required").trim(),
    district: z.string().min(1, "District is required").trim(),
    issueDate: z.string().min(1, "Issue date is required"),
    expireDate: z.string().min(1, "Expire date is required"),
  })
  .refine(
    (data) =>
      new Date(data.expireDate).getTime() >=
      new Date(data.issueDate).getTime(),
    {
      path: ["expireDate"],
      message: "Expire date must be on or after issue date",
    },
  );

export const renewEmployeeSchema = z
  .object({
    titleEn: z.string().min(1, "English title is required").trim(),
    titleLocal: z.string().min(1, "Local title is required").trim(),
    department: z.string().min(1, "Department is required").trim(),
    mobile: z.string().min(1, "Mobile is required").trim(),
    email: optionalEmailSchema,
    nationalId: z.string().min(1, "National ID is required").trim(),
    address: z.string().min(1, "Address is required").trim(),
    district: z.string().min(1, "District is required").trim(),
    issueDate: z.string().min(1, "Issue date is required"),
    expireDate: z.string().min(1, "Expire date is required"),
  })
  .refine(
    (data) =>
      new Date(data.expireDate).getTime() >=
      new Date(data.issueDate).getTime(),
    {
      path: ["expireDate"],
      message: "Expire date must be on or after issue date",
    },
  );