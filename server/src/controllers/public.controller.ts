import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppRequest } from "../types/request";

export const getPublicEmployee = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const { publicIdOrSlug } = req.params;

    const employee = await Employee.findOne({
      publicSlug: publicIdOrSlug,
    }).select("-profileImagePublicId -qrImagePublicId -__v -email -address");

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    res.json(employee);
  },
);
