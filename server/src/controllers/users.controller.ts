import { Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { z } from "zod";
import { createUserSchema } from "../validators/user.validators";
import { AppRequest } from "../types/request";

type CreateUserInput = z.infer<typeof createUserSchema>;

export const listUsers = asyncHandler(
  async (_req: AppRequest, res: Response) => {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    res.json(users);
  },
);

export const createUser = asyncHandler(
  async (req: AppRequest, res: Response) => {
    const { username, password, role } = req.validatedData as CreateUserInput;

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "Username already exists");
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      role,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },
);

export const deleteUser = asyncHandler(
  async (req: AppRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user._id.toString() === req.params.id) {
      throw new ApiError(400, "You cannot delete your own account");
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new ApiError(404, "User not found");
    }

    res.json({ message: "User deleted successfully" });
  },
);
