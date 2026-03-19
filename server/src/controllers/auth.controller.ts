import { Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { z } from "zod";
import { loginSchema, changePasswordSchema } from "../validators/auth.validators";
import { AppRequest } from "../types/request";

type LoginInput = z.infer<typeof loginSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const login = asyncHandler<AppRequest>(async (req, res: Response) => {
  const { username, password } = req.validatedData as LoginInput;

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
});

export const changePassword = asyncHandler<AppRequest>(async (req, res: Response) => {
  const { currentPassword, newPassword } = req.validatedData as ChangePasswordInput;

  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  res.json({ message: "Password changed successfully" });
});