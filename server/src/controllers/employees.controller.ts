import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { Employee } from "../models/Employee";
import { uploadBuffer, deleteImage } from "../services/cloudinary.service";
import { generateQR } from "../services/qr.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

import { z } from "zod";
import { employeeSchema } from "../validators/employee.validators";
import { buildEmployeeHistorySnapshot } from "../utils/employeeHistory";
import { AppRequest } from "../types/request";

type EmployeeInput = z.infer<typeof employeeSchema>;

async function generateAndUploadQR(
  publicSlug: string,
  existingQrPublicId?: string | null,
) {
  const frontendUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const publicUrl = `${frontendUrl}/employee-public/${publicSlug}`;

  const qrBuffer = await generateQR(publicUrl);

  if (existingQrPublicId) {
    await deleteImage(existingQrPublicId);
  }

  return uploadBuffer(qrBuffer, "employeeconnect/qrcodes", `qr_${publicSlug}`);
}

export const listEmployees = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const { search, department, district, status } = req.query;

    const query: Record<string, unknown> = {};

    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { titleEn: { $regex: search, $options: "i" } },
        { titleLocal: { $regex: search, $options: "i" } },
        { empNo: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { nationalId: { $regex: search, $options: "i" } },
      ];
    }

    if (department && typeof department === "string") {
      query.department = { $regex: department, $options: "i" };
    }

    if (district && typeof district === "string") {
      query.district = { $regex: district, $options: "i" };
    }

    let employees = await Employee.find(query).sort({ createdAt: -1 });

    if (status === "Active") {
      employees = employees.filter((e) => new Date() <= new Date(e.expireDate));
    } else if (status === "Expired") {
      employees = employees.filter((e) => new Date() > new Date(e.expireDate));
    }

    console.log("employees: ", employees);
    res.json(employees);
  },
);

export const createEmployee = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const data = req.validatedData as EmployeeInput;

    const existing = await Employee.findOne({ empNo: data.empNo });
    if (existing) {
      throw new ApiError(409, "Employee number already exists");
    }

    const publicSlug = nanoid(12);

    let profileImageUrl: string | null = null;
    let profileImagePublicId: string | null = null;

    if (req.file) {
      const uploaded = await uploadBuffer(
        req.file.buffer,
        "employeeconnect/profiles",
        `profile_${publicSlug}`,
      );
      profileImageUrl = uploaded.secure_url;
      profileImagePublicId = uploaded.public_id;
    }

    const qrUploaded = await generateAndUploadQR(publicSlug);

    const employee = await Employee.create({
      ...data,
      titleEn: data.titleEn,
      titleLocal: data.titleLocal,
      email: data.email,
      issueDate: new Date(data.issueDate),
      expireDate: new Date(data.expireDate),
      publicSlug,
      profileImageUrl,
      profileImagePublicId,
      qrImageUrl: qrUploaded.secure_url,
      qrImagePublicId: qrUploaded.public_id,
      history: [],
    });

    console.log("create req.body:", req.body);
    console.log("create validatedData:", req.validatedData);

    res.status(201).json(employee);
  },
);

export const getEmployee = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }
    console.log("employee: ", employee);
    res.json(employee);
  },
);

export const getEmployeeHistory = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const employee = await Employee.findById(req.params.id).select(
      "empNo name publicSlug history updatedAt",
    );
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    res.json({
      employeeId: employee._id,
      empNo: employee.empNo,
      name: employee.name,
      publicSlug: employee.publicSlug,
      updatedAt: employee.updatedAt,
      history: [...employee.history].sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      ),
    });
  },
);

export const updateEmployee = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    const data = req.validatedData as EmployeeInput;

    if (data.empNo !== employee.empNo) {
      const existing = await Employee.findOne({ empNo: data.empNo });
      if (existing) {
        throw new ApiError(409, "Employee number already exists");
      }
    }

    employee.history.push(buildEmployeeHistorySnapshot(employee));

    let profileImageUrl = employee.profileImageUrl ?? null;
    let profileImagePublicId = employee.profileImagePublicId ?? null;

    if (req.file) {
      if (employee.profileImagePublicId) {
        await deleteImage(employee.profileImagePublicId);
      }

      const uploaded = await uploadBuffer(
        req.file.buffer,
        "employeeconnect/profiles",
        `profile_${employee.publicSlug}`,
      );
      profileImageUrl = uploaded.secure_url;
      profileImagePublicId = uploaded.public_id;
    }

    const qrUploaded = await generateAndUploadQR(
      employee.publicSlug,
      employee.qrImagePublicId,
    );

    employee.empNo = data.empNo;
    employee.name = data.name;
    employee.department = data.department;
    employee.mobile = data.mobile;
    employee.nationalId = data.nationalId;
    employee.address = data.address;
    employee.district = data.district;
    employee.issueDate = new Date(data.issueDate);
    employee.expireDate = new Date(data.expireDate);
    employee.profileImageUrl = profileImageUrl;
    employee.profileImagePublicId = profileImagePublicId;
    employee.qrImageUrl = qrUploaded.secure_url;
    employee.qrImagePublicId = qrUploaded.public_id;
    employee.titleEn = data.titleEn;
    employee.titleLocal = data.titleLocal;
    employee.email = data.email;

    await employee.save();
    console.log("update req.body:", req.body);
    console.log("update validatedData:", req.validatedData);

    res.json(employee);
  },
);

export const deleteEmployee = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    if (employee.profileImagePublicId) {
      await deleteImage(employee.profileImagePublicId);
    }

    if (employee.qrImagePublicId) {
      await deleteImage(employee.qrImagePublicId);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: "Employee deleted successfully" });
  },
);
